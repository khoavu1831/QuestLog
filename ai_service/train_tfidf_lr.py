"""
train_tfidf_lr.py
=================
Training script CUỐI CÙNG cho TF-IDF + Logistic Regression.
Chạy sau khi đã có train_clean.csv và test_clean.csv từ prepare_dataset.py

Cải tiến so với baseline:
  1. max_features: 10k → 50k
  2. sublinear_tf=True (log scaling, chống spam words)
  3. Bỏ stop_words (giữ "not", "never" → signal quan trọng)
  4. Thêm numeric features (word_count, uppercase_ratio, v.v.)
  5. Sparse hstack: TF-IDF + numeric features
  6. Sample weight: giảm tin cậy vào review ngắn label=1
  7. LR: C=4, class_weight='balanced', solver='saga'
"""

import pandas as pd
import numpy as np
import scipy.sparse as sp
import joblib
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
print("Đang đọc dữ liệu...")
train_df = pd.read_csv("train_clean.csv").dropna(subset=['text', 'label'])
test_df  = pd.read_csv("test_clean.csv").dropna(subset=['text', 'label'])

X_train_text = train_df['text']
X_test_text  = test_df['text']
y_train      = train_df['label'].astype(int)
y_test       = test_df['label'].astype(int)

print(f"  Train: {len(train_df):,} | Test: {len(test_df):,}")

# =====================================================================
# STEP 2: NUMERIC FEATURES
# Tách riêng khỏi TF-IDF, ghép lại bằng sparse.hstack
# Lý do: LR không tự nhiên kết hợp được high-dim sparse với dense features
# khi chúng nằm trong cùng 1 pipeline — hstack đảm bảo weight học cùng nhau
# =====================================================================
print("\nĐang tạo numeric features...")

def build_numeric_features(text_series: pd.Series) -> np.ndarray:
    df = pd.DataFrame()

    wc = text_series.str.split().str.len().fillna(0)
    cc = text_series.str.len().fillna(0)

    df['word_count']      = wc
    df['char_count']      = cc

    # Độ giàu từ vựng: review có nhiều từ khác nhau → informative hơn
    df['unique_word_ratio'] = text_series.apply(
        lambda x: len(set(str(x).lower().split())) / (len(str(x).split()) + 1)
    )

    # Cấu trúc câu trung bình — review rõ ràng thường có câu dài vừa phải
    df['avg_word_len'] = cc / (wc + 1)

    # Tín hiệu cảm xúc — cảm thán nhiều thường là review bức xúc/hype, ít useful
    df['exclamation_count'] = text_series.str.count('!')
    df['question_count']    = text_series.str.count(r'\?')

    # Viết hoa nhiều → thường là spam hoặc bức xúc
    df['uppercase_ratio'] = text_series.apply(
        lambda x: sum(1 for c in str(x) if c.isupper()) / (len(str(x)) + 1)
    )

    # Có số liệu cụ thể → informative hơn ("10 hours", "60fps", "2GB")
    df['has_numbers'] = text_series.str.contains(
        r'\b\d+\b', regex=True, na=False
    ).astype(int)

    # Review có cấu trúc Pros/Cons → thường rất hữu ích
    df['has_pros_cons'] = text_series.str.lower().str.contains(
        r'pros?:|cons?:', regex=True, na=False
    ).astype(int)

    # Có từ kết luận rõ ràng → người viết đưa ra khuyến nghị
    df['has_verdict'] = text_series.str.lower().str.contains(
        r'\b(recommend|worth|avoid|skip|buy|don.t buy|waste)\b',
        regex=True, na=False
    ).astype(int)

    return df.fillna(0).values.astype(np.float32)

X_train_num = build_numeric_features(X_train_text)
X_test_num  = build_numeric_features(X_test_text)

print(f"  Numeric features: {X_train_num.shape[1]} cột")

# =====================================================================
# STEP 3: TF-IDF
# =====================================================================
print("\nĐang khởi tạo và fit TF-IDF Vectorizer...")

tfidf = TfidfVectorizer(
    max_features=50_000,      # đủ lớn để bắt hết vocabulary gaming reviews
    ngram_range=(1, 2),       # unigram + bigram: bắt "not good", "highly recommend"
    sublinear_tf=True,        # dùng log(1+tf) thay tf — giảm ảnh hưởng spam words
    min_df=3,                 # bỏ từ xuất hiện < 3 lần — quá hiếm, không reliable
    # Không dùng stop_words='english':
    #   "not worth", "never again", "don't buy" → mất "not", "never", "don't"
    #   → model hiểu sai nghĩa → bỏ stop_words để giữ negation
)

X_train_tfidf = tfidf.fit_transform(X_train_text)
X_test_tfidf  = tfidf.transform(X_test_text)

print(f"  TF-IDF matrix: {X_train_tfidf.shape}")

# =====================================================================
# STEP 4: GHÉP TF-IDF + NUMERIC (sparse hstack)
# =====================================================================
print("\nĐang ghép TF-IDF + numeric features...")

X_train_final = sp.hstack([X_train_tfidf, sp.csr_matrix(X_train_num)])
X_test_final  = sp.hstack([X_test_tfidf,  sp.csr_matrix(X_test_num)])

print(f"  Final feature matrix: {X_train_final.shape}")

# =====================================================================
# STEP 5: SAMPLE WEIGHTS
# Giảm tin tưởng vào các mẫu "đáng ngờ":
#   - Review < 10 từ nhưng được vote helpful: có thể là meme/viral review
#     ("git gud", "10/10 would die again") — được vote vì buồn cười, không informative
# =====================================================================
print("\nĐang tính sample weights...")

wc_train = train_df['text'].str.split().str.len().fillna(0)
sample_weights = np.ones(len(train_df), dtype=np.float32)

# Review siêu ngắn nhưng label=1 → đáng ngờ, giảm weight xuống 30%
suspicious_mask = (wc_train < 10) & (train_df['label'] == 1)
sample_weights[suspicious_mask.values] = 0.3
print(f"  Số mẫu đánh weight thấp (0.3): {suspicious_mask.sum():,}")

# =====================================================================
# STEP 6: HUẤN LUYỆN LOGISTIC REGRESSION
# =====================================================================
print("\nĐang huấn luyện Logistic Regression...")

lr_model = LogisticRegression(
    C=4,                      # giảm regularization (default=1) → model tự do hơn
    max_iter=2000,
    class_weight='balanced',  # tự động bù class imbalance nếu có
    solver='saga',            # tốt nhất với large sparse matrix + l2
    random_state=RANDOM_STATE,
    n_jobs=-1,
    verbose=0,
)

lr_model.fit(X_train_final, y_train, sample_weight=sample_weights)
print("  Huấn luyện hoàn tất.")

# =====================================================================
# STEP 7: ĐÁNH GIÁ
# =====================================================================
print("\nĐang dự đoán trên tập test...")
y_pred      = lr_model.predict(X_test_final)
y_pred_prob = lr_model.predict_proba(X_test_final)[:, 1]

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall    = recall_score(y_test, y_pred, zero_division=0)
f1        = f1_score(y_test, y_pred, zero_division=0)
cm        = confusion_matrix(y_test, y_pred)

print("\n" + "=" * 50)
print(" 4 ĐỘ ĐO ĐÁNH GIÁ — TF-IDF (v2) + LR")
print("=" * 50)
print(f"1. Accuracy  (Độ chính xác): {accuracy:.4f}")
print(f"2. Precision (Độ chuẩn xác): {precision:.4f}")
print(f"3. Recall    (Độ bao phủ):   {recall:.4f}")
print(f"4. F1-Score  (Điểm F1):      {f1:.4f}")

print("\nMa trận nhầm lẫn (Confusion Matrix):")
print(cm)
print(f"  TN={cm[0,0]:,} | FP={cm[0,1]:,}")
print(f"  FN={cm[1,0]:,} | TP={cm[1,1]:,}")

# =====================================================================
# STEP 8: LƯU MODEL (dùng cho ai_service/app.py)
# =====================================================================
joblib.dump(lr_model, "lr_model.pkl")
joblib.dump(tfidf,    "tfidf_vectorizer.pkl")

print("\n✅ Đã lưu lr_model.pkl và tfidf_vectorizer.pkl")
print("   (Copy vào thư mục ai_service/ để deploy)")
