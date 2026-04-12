"""
train_tfidf_lgb.py
==================
So sánh TF-IDF + LR (baseline mới) vs TF-IDF + LightGBM.
Dùng CÙNG feature pipeline để so sánh công bằng.

Ghi chú LightGBM với TF-IDF sparse:
  - colsample_bytree phải THẤP (~0.1-0.15): 50k features, không cần xét hết
  - Không dùng GPU cho LGB vì GPU LGB không hỗ trợ sparse matrix tốt
  - Thời gian ước tính Kaggle CPU: ~15-25 phút với early stopping
"""

import numpy as np
import pandas as pd
import scipy.sparse as sp
import joblib
import lightgbm as lgb
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, confusion_matrix
)

RANDOM_STATE = 42

# =====================================================================
# STEP 1: ĐỌC DATA
# =====================================================================
print("Đọc dữ liệu...")
train_df = pd.read_csv("train_clean.csv").dropna(subset=['text', 'label'])
test_df  = pd.read_csv("test_clean.csv").dropna(subset=['text', 'label'])

X_train_text = train_df['text']
X_test_text  = test_df['text']
y_train      = train_df['label'].astype(int).values
y_test       = test_df['label'].astype(int).values

print(f"  Train: {len(train_df):,} | Test: {len(test_df):,}")

# =====================================================================
# STEP 2: NUMERIC FEATURES (giống train_tfidf_lr.py)
# =====================================================================
print("\nTạo numeric features...")

def build_numeric_features(text_series: pd.Series) -> np.ndarray:
    df = pd.DataFrame()
    wc = text_series.str.split().str.len().fillna(0)
    cc = text_series.str.len().fillna(0)
    df['word_count']       = wc
    df['char_count']       = cc
    df['unique_word_ratio'] = text_series.apply(
        lambda x: len(set(str(x).lower().split())) / (len(str(x).split()) + 1)
    )
    df['avg_word_len']     = cc / (wc + 1)
    df['exclamation_count'] = text_series.str.count('!')
    df['question_count']   = text_series.str.count(r'\?')
    df['uppercase_ratio']  = text_series.apply(
        lambda x: sum(1 for c in str(x) if c.isupper()) / (len(str(x)) + 1)
    )
    df['has_numbers']  = text_series.str.contains(r'\b\d+\b', regex=True, na=False).astype(int)
    df['has_pros_cons'] = text_series.str.lower().str.contains(r'pros?:|cons?:', regex=True, na=False).astype(int)
    df['has_verdict']  = text_series.str.lower().str.contains(
        r'\b(recommend|worth|avoid|skip|buy|don.t buy|waste)\b', regex=True, na=False
    ).astype(int)
    return df.fillna(0).values.astype(np.float32)

X_train_num = build_numeric_features(X_train_text)
X_test_num  = build_numeric_features(X_test_text)

# =====================================================================
# STEP 3: TF-IDF (giống train_tfidf_lr.py)
# =====================================================================
print("Fit TF-IDF...")
tfidf = TfidfVectorizer(
    max_features=50_000,
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=3,
)
X_train_tfidf = tfidf.fit_transform(X_train_text)
X_test_tfidf  = tfidf.transform(X_test_text)
print(f"  TF-IDF shape: {X_train_tfidf.shape}")

# Sparse hstack
X_train_final = sp.hstack([X_train_tfidf, sp.csr_matrix(X_train_num)])
X_test_final  = sp.hstack([X_test_tfidf,  sp.csr_matrix(X_test_num)])

# Sample weights (giống LR script)
wc_train = train_df['text'].str.split().str.len().fillna(0)
sample_weights = np.ones(len(train_df), dtype=np.float32)
suspicious_mask = (wc_train < 10) & (train_df['label'] == 1)
sample_weights[suspicious_mask.values] = 0.3

# =====================================================================
# HELPER: In kết quả
# =====================================================================
def print_results(name, y_true, y_pred, cm):
    print(f"\n{'='*52}")
    print(f" KẾT QUẢ — {name}")
    print(f"{'='*52}")
    print(f"1. Accuracy  : {accuracy_score(y_true, y_pred):.4f}")
    print(f"2. Precision : {precision_score(y_true, y_pred, zero_division=0):.4f}")
    print(f"3. Recall    : {recall_score(y_true, y_pred, zero_division=0):.4f}")
    print(f"4. F1-Score  : {f1_score(y_true, y_pred, zero_division=0):.4f}")
    print(f"\nConfusion Matrix:")
    print(cm)
    print(f"  TN={cm[0,0]:,} | FP={cm[0,1]:,}")
    print(f"  FN={cm[1,0]:,} | TP={cm[1,1]:,}")

# =====================================================================
# MODEL A: LR (tham chiếu — dùng cùng features với LGB)
# =====================================================================
print("\n" + "="*52)
print(" [1/2] Huấn luyện TF-IDF + LR (tham chiếu)...")
print("="*52)

lr_model = LogisticRegression(
    C=4, max_iter=2000,
    class_weight='balanced',
    solver='saga',
    random_state=RANDOM_STATE,
    n_jobs=-1,
)
lr_model.fit(X_train_final, y_train, sample_weight=sample_weights)

y_pred_lr = lr_model.predict(X_test_final)
cm_lr     = confusion_matrix(y_test, y_pred_lr)
print_results("TF-IDF + LR", y_test, y_pred_lr, cm_lr)

# =====================================================================
# MODEL B: LIGHTGBM
# Lưu ý tham số quan trọng với TF-IDF sparse:
#   colsample_bytree=0.1 : chỉ xét 10% features (5000/50k) mỗi node
#                          → tránh overfit và tăng tốc nhiều
#   num_leaves=63        : độ phức tạp tree vừa đủ
#   min_child_samples=50 : tránh split trên quá ít samples
# =====================================================================
print("\n" + "="*52)
print(" [2/2] Huấn luyện TF-IDF + LightGBM...")
print("="*52)
print("  (Ước tính ~15-25 phút trên Kaggle CPU)")

# Tạo LGB Dataset (native format, nhanh hơn scikit-learn API)
lgb_train = lgb.Dataset(
    X_train_final, label=y_train,
    weight=sample_weights,
    free_raw_data=False
)
lgb_test = lgb.Dataset(
    X_test_final, label=y_test,
    reference=lgb_train,
    free_raw_data=False
)

params = {
    "objective":        "binary",
    "metric":           "binary_logloss",
    "learning_rate":    0.05,
    "num_leaves":       63,
    "max_depth":        -1,
    "min_child_samples": 50,

    # ↓ QUAN TRỌNG với TF-IDF sparse high-dim
    "colsample_bytree": 0.1,    # chỉ xét 10% features/node → ~5000 features
    "subsample":        0.8,    # 80% samples/tree
    "subsample_freq":   5,

    "reg_alpha":  0.1,          # L1
    "reg_lambda": 0.1,          # L2
    "is_unbalance": True,       # tương đương class_weight='balanced'

    "n_jobs":    -1,
    "verbose":   -1,
    "seed":      RANDOM_STATE,
}

callbacks = [
    lgb.early_stopping(stopping_rounds=50, verbose=True),
    lgb.log_evaluation(period=50),   # log mỗi 50 rounds
]

lgb_model = lgb.train(
    params,
    lgb_train,
    num_boost_round=1000,         # max 1000 trees, early stopping sẽ dừng sớm
    valid_sets=[lgb_train, lgb_test],
    valid_names=["train", "test"],
    callbacks=callbacks,
)

print(f"\n  Best iteration: {lgb_model.best_iteration}")

y_pred_prob_lgb = lgb_model.predict(X_test_final)
y_pred_lgb      = (y_pred_prob_lgb >= 0.5).astype(int)
cm_lgb          = confusion_matrix(y_test, y_pred_lgb)
print_results("TF-IDF + LightGBM", y_test, y_pred_lgb, cm_lgb)

# =====================================================================
# SO SÁNH
# =====================================================================
f1_lr  = f1_score(y_test, y_pred_lr,  zero_division=0)
f1_lgb = f1_score(y_test, y_pred_lgb, zero_division=0)
acc_lr  = accuracy_score(y_test, y_pred_lr)
acc_lgb = accuracy_score(y_test, y_pred_lgb)

print("\n" + "="*52)
print(" BẢNG SO SÁNH")
print("="*52)
print(f"{'Model':<25} {'Accuracy':>10} {'F1':>10}")
print("-"*52)
print(f"{'TF-IDF + LR':<25} {acc_lr:>10.4f} {f1_lr:>10.4f}")
print(f"{'TF-IDF + LightGBM':<25} {acc_lgb:>10.4f} {f1_lgb:>10.4f}")
winner = "LightGBM" if f1_lgb > f1_lr else "LR"
print(f"\n  🏆 Winner (by F1): {winner}")
print(f"  Δ Accuracy = {acc_lgb - acc_lr:+.4f}")
print(f"  Δ F1       = {f1_lgb  - f1_lr:+.4f}")

# =====================================================================
# LƯU LGB MODEL (nếu muốn dùng sau)
# =====================================================================
lgb_model.save_model("lgb_model.txt")
joblib.dump(tfidf, "tfidf_vectorizer_lgb.pkl")
print("\n✅ Đã lưu lgb_model.txt và tfidf_vectorizer_lgb.pkl")
