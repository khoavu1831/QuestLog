"""
app.py - QuestLog AI Service
==============================
Flask API hỗ trợ 4 model phân loại review hữu ích:
  - lr       : TF-IDF (50k features + numeric) + Logistic Regression
  - lgb      : TF-IDF (50k features) + LightGBM
  - lstm     : BiLSTM với GloVe 100d embeddings
  - distilbert: DistilBERT fine-tuned (mặc định cho lọc tự động)

Endpoints:
  POST /classify  : phân loại 1 review, tham số model_type tùy chọn
  GET  /health    : kiểm tra trạng thái

Hardware: chạy tốt trên CPU (i5+), tự động dùng GPU nếu CUDA có sẵn.
"""

import os
import re
import numpy as np
import joblib
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Cho phép frontend (port 5173) gọi Flask (port 5001)

# =====================================================================
# ĐƯỜNG DẪN MODEL - chỉnh lại nếu cần
# =====================================================================
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "Model")

PATHS = {
    "lr_model":         os.path.join(MODEL_DIR, "lr_model.pkl"),
    "lr_vectorizer":    os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"),
    "lgb_model":        os.path.join(MODEL_DIR, "lgb_model.txt"),
    "lgb_vectorizer":   os.path.join(MODEL_DIR, "tfidf_vectorizer_lgb.pkl"),
    "lstm_model":       os.path.join(MODEL_DIR, "lstm_model.keras"),
    "lstm_tokenizer":   os.path.join(MODEL_DIR, "lstm_tokenizer.pkl"),
    "distilbert_model": os.path.join(MODEL_DIR, "distilbert_model"),
}

# =====================================================================
# LAZY-LOAD MODELS (chỉ load khi request đầu tiên gọi model đó)
# =====================================================================
_models = {}

def get_lr():
    if "lr" not in _models:
        log.info("Loading TF-IDF + LR...")
        import scipy.sparse as sp
        _models["lr"] = {
            "model": joblib.load(PATHS["lr_model"]),
            "vectorizer": joblib.load(PATHS["lr_vectorizer"]),
            "sp": sp,
        }
        log.info("TF-IDF + LR loaded ✓")
    return _models["lr"]

def get_lgb():
    if "lgb" not in _models:
        log.info("Loading LightGBM...")
        import lightgbm as lgb_lib
        booster = lgb_lib.Booster(model_file=PATHS["lgb_model"])
        vectorizer = joblib.load(PATHS["lgb_vectorizer"])
        _models["lgb"] = {"booster": booster, "vectorizer": vectorizer}
        log.info("LightGBM loaded ✓")
    return _models["lgb"]

def get_lstm():
    if "lstm" not in _models:
        log.info("Loading LSTM...")
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
        import tensorflow as tf
        from tensorflow.keras.models import load_model
        from tensorflow.keras.preprocessing.sequence import pad_sequences
        keras_model = load_model(PATHS["lstm_model"])
        lstm_tokenizer = joblib.load(PATHS["lstm_tokenizer"])
        _models["lstm"] = {
            "model": keras_model,
            "tokenizer": lstm_tokenizer,
            "pad_sequences": pad_sequences,
        }
        log.info("LSTM loaded ✓")
    return _models["lstm"]

def get_distilbert():
    if "distilbert" not in _models:
        log.info("Loading DistilBERT...")
        from transformers import pipeline
        import torch
        device = 0 if torch.cuda.is_available() else -1
        log.info(f"  Using device: {'GPU (CUDA)' if device == 0 else 'CPU'}")
        pipe = pipeline(
            "text-classification",
            model=PATHS["distilbert_model"],
            device=device,
            truncation=True,
            max_length=256,
        )
        _models["distilbert"] = {"pipe": pipe}
        log.info("DistilBERT loaded ✓")
    return _models["distilbert"]

# =====================================================================
# NUMERIC FEATURES (dùng cho TF-IDF + LR — phải đồng nhất với training)
# =====================================================================
def build_numeric_features_single(text: str) -> np.ndarray:
    """Tính 10 numeric features cho 1 review đơn lẻ."""
    import scipy.sparse as sp

    words = text.split()
    wc = len(words)
    cc = len(text)

    unique_word_ratio = len(set(text.lower().split())) / (wc + 1) if wc else 0
    avg_word_len      = cc / (wc + 1) if wc else 0
    exclamation_count = text.count('!')
    question_count    = text.count('?')
    uppercase_ratio   = sum(1 for c in text if c.isupper()) / (cc + 1) if cc else 0
    has_numbers       = int(bool(re.search(r'\b\d+\b', text)))
    has_pros_cons     = int(bool(re.search(r'pros?:|cons?:', text.lower())))
    has_verdict       = int(bool(re.search(
        r'\b(recommend|worth|avoid|skip|buy|don.t buy|waste)\b', text.lower()
    )))

    return np.array([[
        wc, cc, unique_word_ratio, avg_word_len,
        exclamation_count, question_count, uppercase_ratio,
        has_numbers, has_pros_cons, has_verdict,
    ]], dtype=np.float32)

# =====================================================================
# TIỀN XỬ LÝ VĂN BẢN CHO LSTM (giống lúc training)
# =====================================================================
LSTM_MAX_LEN = 256

def clean_for_lstm(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r"n't", " not", text)
    text = re.sub(r"'re", " are", text)
    text = re.sub(r"'ve", " have", text)
    text = re.sub(r"'ll", " will", text)
    text = re.sub(r"'m", " am", text)
    text = re.sub(r'[^a-z0-9\s!?]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# =====================================================================
# CÁC HÀM PREDICT CHO TỪNG MODEL
# =====================================================================

def predict_lr(text: str) -> dict:
    """TF-IDF + Logistic Regression (có numeric features)."""
    bundle = get_lr()
    import scipy.sparse as sp

    tfidf_feat  = bundle["vectorizer"].transform([text])
    num_feat    = build_numeric_features_single(text)
    X           = sp.hstack([tfidf_feat, sp.csr_matrix(num_feat)])

    proba       = bundle["model"].predict_proba(X)[0]
    classes     = list(bundle["model"].classes_)
    idx         = classes.index(1) if 1 in classes else 0
    prob        = float(proba[idx])

    label       = "HELPFUL" if prob >= 0.5 else "NOT HELPFUL"
    score       = round(prob * 100, 2)
    return {"label": label, "score": score, "prob": prob}


def predict_lgb(text: str) -> dict:
    """TF-IDF + LightGBM (50k TF-IDF + 10 numeric = 50,010 features)."""
    import scipy.sparse as sp
    bundle   = get_lgb()
    tfidf_feat = bundle["vectorizer"].transform([text])
    num_feat   = build_numeric_features_single(text)
    features   = sp.hstack([tfidf_feat, sp.csr_matrix(num_feat)])
    prob     = float(bundle["booster"].predict(features)[0])
    label    = "HELPFUL" if prob >= 0.5 else "NOT HELPFUL"
    score    = round(prob * 100, 2)
    return {"label": label, "score": score, "prob": prob}


def predict_lstm(text: str) -> dict:
    """Bidirectional LSTM với GloVe embeddings."""
    bundle  = get_lstm()
    cleaned = clean_for_lstm(text)
    seq     = bundle["tokenizer"].texts_to_sequences([cleaned])
    padded  = bundle["pad_sequences"](
        seq, maxlen=LSTM_MAX_LEN, padding='post', truncating='post'
    )
    prob    = float(bundle["model"].predict(padded, verbose=0)[0][0])
    label   = "HELPFUL" if prob >= 0.5 else "NOT HELPFUL"
    score   = round(prob * 100, 2)
    return {"label": label, "score": score, "prob": prob}


def predict_distilbert(text: str) -> dict:
    """DistilBERT fine-tuned."""
    bundle = get_distilbert()
    result = bundle["pipe"](text[:512])[0]   # truncate hard limit
    raw_label = result["label"].upper()
    # HuggingFace trả về label như trong id2label của model ("HELPFUL"/"NOT HELPFUL")
    label = raw_label if raw_label in ("HELPFUL", "NOT HELPFUL") else (
        "HELPFUL" if raw_label in ("LABEL_1", "1") else "NOT HELPFUL"
    )
    prob  = float(result["score"]) if label == "HELPFUL" else 1 - float(result["score"])
    score = round(prob * 100, 2)
    return {"label": label, "score": score, "prob": prob}

# =====================================================================
# ENDPOINT CHÍNH
# =====================================================================

@app.route("/classify", methods=["POST"])
def classify():
    data        = request.get_json(force=True)
    text        = str(data.get("text", "")).strip()
    model_type  = str(data.get("model_type", "distilbert")).lower()

    if not text or len(text.split()) < 3:
        return jsonify({"label": "NOT HELPFUL", "score": 100.0, "prob": 0.0,
                        "model_used": model_type})

    try:
        if model_type == "lr":
            result = predict_lr(text)
        elif model_type == "lgb":
            result = predict_lgb(text)
        elif model_type == "lstm":
            result = predict_lstm(text)
        else:  # default: distilbert
            result = predict_distilbert(text)
    except Exception as e:
        log.error(f"Prediction error ({model_type}): {e}")
        return jsonify({"error": str(e), "label": "NOT HELPFUL", "score": 0.0}), 500

    result["model_used"] = model_type
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "loaded_models": list(_models.keys()),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
