"""
train_lstm.py
=============
Training script cho mô hình LSTM phân loại review hữu ích.
Chạy trên Kaggle GPU (T4 hoặc P100).

Yêu cầu:
  - train_clean.csv, test_clean.csv (từ prepare_dataset.py)
  - GloVe 100d embeddings: thêm dataset "GloVe Global Vectors" trên Kaggle
    Đường dẫn: /kaggle/input/glove-global-vectors-for-word-representation/glove.6B.100d.txt

Kiến trúc:
  Embedding (GloVe pretrained, frozen)
    → Bidirectional LSTM (128 units)
    → Dropout(0.3)
    → GlobalMaxPooling1D
    → Dense (64, relu) + Dropout(0.4)
    → Dense (1, sigmoid)

Lý do chọn kiến trúc này:
  - Bidirectional: đọc context từ cả 2 chiều ("not good" ≠ "good not")
  - GlobalMaxPooling: ổn định hơn lấy hidden state cuối
  - GloVe frozen: domain game reviews có đủ trong GloVe, fine-tune dễ overfit với dataset này

Kaggle GPU (T4 16GB):
  - BATCH_SIZE=128: T4 xử lý tốt, training nhanh hơn ~2x so với 64
  - recurrent_dropout=0 (QUAN TRỌNG): nếu > 0 → TF tắt cuDNN kernel → chậm 3-5x
    Thay bằng Dropout layer riêng sau BiLSTM — regularization vẫn đủ
  - fp16 không dùng ở đây (Keras LSTM không stable với mixed precision)
"""

import os
import re
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Embedding, Bidirectional, LSTM,
    GlobalMaxPooling1D, Dense, Dropout
)
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, confusion_matrix
)
import joblib

# Tắt warning không cần thiết
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# =====================================================================
# CẤU HÌNH
# =====================================================================
GLOVE_PATH  = "/kaggle/input/glove-global-vectors-for-word-representation/glove.6B.100d.txt"
MAX_VOCAB   = 50_000    # đồng nhất với TF-IDF để so sánh công bằng
MAX_LEN     = 256       # cắt/pad về 256 tokens — đủ cho phần lớn game reviews
EMBED_DIM   = 100       # GloVe 100d
LSTM_UNITS  = 128
BATCH_SIZE  = 128       # Kaggle T4 16GB: 128 < 64 padding 256 → ~4GB, rất thoải mái
EPOCHS      = 15        # EarlyStopping patience=3 → thực tế dừng ở epoch 6-9
RANDOM_SEED = 42

tf.random.set_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# =====================================================================
# STEP 1: ĐỌC DATA
# =====================================================================
print("=" * 60)
print("STEP 1: Đọc dữ liệu...")
print("=" * 60)

train_df = pd.read_csv("train_clean.csv").dropna(subset=['text', 'label'])
test_df  = pd.read_csv("test_clean.csv").dropna(subset=['text', 'label'])

y_train = train_df['label'].astype(int).values
y_test  = test_df['label'].astype(int).values

print(f"  Train: {len(train_df):,} | Test: {len(test_df):,}")

# =====================================================================
# STEP 2: TIỀN XỬ LÝ VĂN BẢN
# LSTM cần clean text hơn TF-IDF vì mỗi token chiếm 1 slot trong sequence
# =====================================================================
print("\nSTEP 2: Tiền xử lý văn bản...")

def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'<[^>]+>', ' ', text)          # xóa HTML tags
    text = re.sub(r'http\S+|www\S+', ' ', text)   # xóa URLs
    text = re.sub(r"n't", " not", text)            # don't → do not (giữ negation)
    text = re.sub(r"'re", " are", text)
    text = re.sub(r"'ve", " have", text)
    text = re.sub(r"'ll", " will", text)
    text = re.sub(r"'m", " am", text)
    text = re.sub(r'[^a-z0-9\s!?]', ' ', text)   # giữ chữ, số, ! và ?
    text = re.sub(r'\s+', ' ', text).strip()
    return text

X_train_text = train_df['text'].apply(clean_text).tolist()
X_test_text  = test_df['text'].apply(clean_text).tolist()

print(f"  Ví dụ sau clean: '{X_train_text[0][:80]}...'")

# =====================================================================
# STEP 3: TOKENIZATION
# =====================================================================
print("\nSTEP 3: Tokenization...")

tokenizer = Tokenizer(num_words=MAX_VOCAB, oov_token='<OOV>')
tokenizer.fit_on_texts(X_train_text)   # chỉ fit trên train, không dùng test

X_train_seq = tokenizer.texts_to_sequences(X_train_text)
X_test_seq  = tokenizer.texts_to_sequences(X_test_text)

# Pad/truncate về MAX_LEN
# post padding: <PAD> ở cuối → LSTM đọc nội dung trước, padding sau (tốt hơn pre)
X_train_pad = pad_sequences(X_train_seq, maxlen=MAX_LEN, padding='post', truncating='post')
X_test_pad  = pad_sequences(X_test_seq,  maxlen=MAX_LEN, padding='post', truncating='post')

vocab_size   = min(MAX_VOCAB, len(tokenizer.word_index) + 1)
print(f"  Vocabulary size thực tế: {vocab_size:,}")
print(f"  Sequence shape: {X_train_pad.shape}")

# Lưu tokenizer để dùng trong app.py
joblib.dump(tokenizer, "lstm_tokenizer.pkl")

# =====================================================================
# STEP 4: TẢI GLOVE EMBEDDINGS
# =====================================================================
print("\nSTEP 4: Tải GloVe embeddings...")

embeddings_index = {}
with open(GLOVE_PATH, encoding='utf-8') as f:
    for line in f:
        parts = line.split()
        word  = parts[0]
        vec   = np.array(parts[1:], dtype=np.float32)
        embeddings_index[word] = vec

print(f"  Tổng số từ trong GloVe: {len(embeddings_index):,}")

# Tạo embedding matrix
embedding_matrix = np.zeros((vocab_size, EMBED_DIM), dtype=np.float32)
found = 0
for word, idx in tokenizer.word_index.items():
    if idx >= MAX_VOCAB:
        continue
    vec = embeddings_index.get(word)
    if vec is not None:
        embedding_matrix[idx] = vec
        found += 1

coverage = found / min(vocab_size, len(tokenizer.word_index)) * 100
print(f"  GloVe coverage: {found:,}/{min(vocab_size, len(tokenizer.word_index)):,} = {coverage:.1f}%")
# Coverage ~70-80% là bình thường với gaming jargon

# =====================================================================
# STEP 5: XÂY DỰNG MÔ HÌNH
# =====================================================================
print("\nSTEP 5: Xây dựng mô hình LSTM...")

model = Sequential([
    # Embedding layer — dùng GloVe pretrained, freeze để không overfit
    Embedding(
        input_dim=vocab_size,
        output_dim=EMBED_DIM,
        weights=[embedding_matrix],
        input_length=MAX_LEN,
        trainable=False,            # freeze: GloVe đã đủ tốt, fine-tune dễ overfit
        name='embedding'
    ),

    # Bidirectional LSTM:
    #   - Forward: đọc từ trái sang phải
    #   - Backward: đọc từ phải sang trái
    #   → Nắm được "not worth buying" từ cả 2 chiều
    #
    # ⚠ QUAN TRỌNG: recurrent_dropout PHẢI = 0
    #   Nếu > 0 → TensorFlow tắt cuDNN kernel, dùng generic implementation
    #   → chậm 3-5x trên GPU. Dùng Dropout layer riêng bên dưới thay thế.
    Bidirectional(LSTM(
        LSTM_UNITS,
        return_sequences=True,
        dropout=0.0,                # để 0 để đảm bảo cuDNN kernel
        recurrent_dropout=0.0,      # PHẢI = 0 → cuDNN compatible
    ), name='bilstm'),

    # Dropout sau LSTM — thay thế recurrent_dropout, regularization vẫn hiệu quả
    Dropout(0.3, name='dropout_lstm'),

    # GlobalMaxPooling: lấy giá trị max theo từng chiều feature
    # → Bắt được "từ/cụm từ quan trọng nhất" trong toàn bộ review
    # → Ổn định hơn last hidden state vì không bị ảnh hưởng bởi padding
    GlobalMaxPooling1D(name='global_max_pool'),

    Dense(64, activation='relu', name='fc1'),
    Dropout(0.4, name='dropout_fc'),

    Dense(1, activation='sigmoid', name='output')   # binary classification
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.summary()

# =====================================================================
# STEP 6: CALLBACKS
# =====================================================================
callbacks = [
    EarlyStopping(
        monitor='val_accuracy',
        patience=3,             # dừng nếu 3 epoch liên tiếp không cải thiện
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,             # giảm lr xuống 1/2 khi plateau
        patience=2,
        min_lr=1e-5,
        verbose=1
    )
]

# =====================================================================
# STEP 7: HUẤN LUYỆN
# =====================================================================
print("\nSTEP 6: Huấn luyện...")

history = model.fit(
    X_train_pad, y_train,
    validation_data=(X_test_pad, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=callbacks,
    verbose=1
)

# =====================================================================
# STEP 8: ĐÁNH GIÁ
# =====================================================================
print("\nSTEP 7: Đánh giá trên tập test...")

y_pred_prob = model.predict(X_test_pad, batch_size=BATCH_SIZE, verbose=0).flatten()
y_pred      = (y_pred_prob >= 0.5).astype(int)

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall    = recall_score(y_test, y_pred, zero_division=0)
f1        = f1_score(y_test, y_pred, zero_division=0)
cm        = confusion_matrix(y_test, y_pred)

print("\n" + "=" * 50)
print(" 4 ĐỘ ĐO ĐÁNH GIÁ — Bidirectional LSTM")
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
# STEP 9: LƯU MODEL
# =====================================================================
print("\nSTEP 8: Lưu model...")

model.save("lstm_model.keras")
print("✅ Đã lưu:")
print("   - lstm_model.keras     (model weights + architecture)")
print("   - lstm_tokenizer.pkl   (tokenizer, dùng để inference)")
print("\n   Copy cả 2 file vào thư mục ai_service/ để deploy")
