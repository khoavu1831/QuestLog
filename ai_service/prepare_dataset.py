"""
prepare_dataset.py
==================
Script chuẩn bị dataset CUỐI CÙNG cho bài toán phân loại review hữu ích.
Chạy 1 lần trên Kaggle, output: train_clean.csv và test_clean.csv

Thay đổi so với phiên bản cũ:
  - BỎ stratified length balancing (phá signal tự nhiên của độ dài)
  - GIỮ class balance 50-50 bằng random sampling (không phải length-stratified)
  - Thêm cột word_count vào output (dùng cho sample_weight sau này)
  - Thêm min_words filter để loại các review quá ngắn (< 5 từ) — noise순
"""

import pandas as pd
import numpy as np

# =====================================================================
# CẤU HÌNH
# =====================================================================
FILE_PATH      = "/kaggle/input/datasets/minhtri724/datacuatao/Video_Games.jsonl"
TARGET_TRAIN   = 60_000     # mỗi class
TARGET_TEST    = 10_000     # mỗi class
MIN_WORDS      = 5          # review < 5 từ → noise, bỏ luôn
COLD_START_DAYS = 180       # review < 6 tháng tuổi mà 0 vote → cold start → bỏ
RANDOM_STATE   = 42

# =====================================================================
# STEP 1: ĐỌC VÀ LỌC THÔ
# =====================================================================
print("=" * 60)
print("STEP 1: Đọc và lọc dữ liệu thô...")
print("=" * 60)

chunks = []
for chunk in pd.read_json(FILE_PATH, lines=True, chunksize=100_000):
    # Bắt buộc có text và title
    chunk = chunk.dropna(subset=['text', 'title'])

    # Ghép title + text (giữ nguyên từ v1, tốt vì bổ sung ngữ cảnh)
    chunk['text_combined'] = (
        chunk['title'].astype(str).str.strip()
        + ". "
        + chunk['text'].astype(str).str.strip()
    )

    chunk['word_count'] = chunk['text_combined'].str.split().str.len()

    # Chỉ lấy: helpful >= 5 (label 1) hoặc helpful == 0 (label 0 tiềm năng)
    # Bỏ vote 1-4: nhiễu, không rõ ràng
    chunk = chunk[
        (chunk['helpful_vote'] >= 5) | (chunk['helpful_vote'] == 0)
    ]

    # Bỏ review quá ngắn (< MIN_WORDS) — quá ngắn để có signal ngôn ngữ
    chunk = chunk[chunk['word_count'] >= MIN_WORDS]

    chunks.append(chunk[[
        'text_combined', 'helpful_vote', 'timestamp', 'word_count'
    ]])

df = pd.concat(chunks, ignore_index=True)
print(f"  Tổng sau khi lọc thô: {len(df):,} dòng")

# =====================================================================
# STEP 2: XỬ LÝ COLD START
# =====================================================================
print("\nSTEP 2: Lọc cold start...")

df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms', errors='coerce')
df = df.dropna(subset=['timestamp'])

max_ts    = df['timestamp'].max()
threshold = max_ts - pd.Timedelta(days=COLD_START_DAYS)

# Giữ lại:
#   - Review helpful (>= 5): luôn giữ
#   - Review 0 vote nhưng ĐÃ đủ thời gian được xem (> 6 tháng tuổi)
df = df[
    (df['helpful_vote'] >= 5)
    | ((df['helpful_vote'] == 0) & (df['timestamp'] < threshold))
]

df['label'] = (df['helpful_vote'] >= 5).astype(int)
print(f"  Tổng sau cold start filter: {len(df):,} dòng")
print(f"  Label 1 (helpful):  {(df['label']==1).sum():,}")
print(f"  Label 0 (not):      {(df['label']==0).sum():,}")

# =====================================================================
# STEP 3: TÁCH THEO CLASS VÀ RANDOM SAMPLE (KHÔNG stratify theo length)
# =====================================================================
print("\nSTEP 3: Tách class và sampling...")

good = df[df['label'] == 1].sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
bad  = df[df['label'] == 0].sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

print(f"  Khả dụng — label 1: {len(good):,} | label 0: {len(bad):,}")

# Kiểm tra đủ data không
needed = TARGET_TRAIN + TARGET_TEST
if len(good) < needed or len(bad) < needed:
    print("  ⚠ CẢNH BÁO: Không đủ data cho target. Điều chỉnh tỷ lệ 85/15...")
    limit        = min(len(good), len(bad))
    TARGET_TRAIN = int(limit * 0.85)
    TARGET_TEST  = limit - TARGET_TRAIN
    print(f"  Điều chỉnh → TARGET_TRAIN={TARGET_TRAIN:,} | TARGET_TEST={TARGET_TEST:,}")

# =====================================================================
# STEP 4: TẠO TRAIN VÀ TEST SET
# =====================================================================
print("\nSTEP 4: Tạo train/test split...")

train_df = pd.concat([
    good.iloc[:TARGET_TRAIN],
    bad.iloc[:TARGET_TRAIN]
]).sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

test_df = pd.concat([
    good.iloc[TARGET_TRAIN : TARGET_TRAIN + TARGET_TEST],
    bad.iloc[TARGET_TRAIN : TARGET_TRAIN + TARGET_TEST]
]).sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

# =====================================================================
# STEP 5: DEDUP GIỮA TRAIN VÀ TEST
# =====================================================================
print("\nSTEP 5: Loại bỏ trùng lặp...")

overlap = set(train_df['text_combined']) & set(test_df['text_combined'])
if overlap:
    print(f"  Tìm thấy {len(overlap):,} dòng trùng giữa train/test → xóa khỏi test")
    test_df = test_df[~test_df['text_combined'].isin(overlap)].reset_index(drop=True)

# =====================================================================
# STEP 6: LƯU FILE
# =====================================================================
print("\nSTEP 6: Lưu file...")

# Đổi tên cột để thống nhất với các model
train_df = train_df.rename(columns={'text_combined': 'text'})
test_df  = test_df.rename(columns={'text_combined': 'text'})

# Lưu text + label + word_count (word_count dùng cho sample_weight trong TF-IDF)
train_df[['text', 'label', 'word_count']].to_csv('train_clean.csv', index=False)
test_df[['text', 'label', 'word_count']].to_csv('test_clean.csv',  index=False)

# =====================================================================
# THỐNG KÊ CUỐI
# =====================================================================
print("\n" + "=" * 60)
print("THỐNG KÊ TRAIN")
print("=" * 60)
print(f"  Tổng: {len(train_df):,}")
print(train_df['label'].value_counts().to_string())
print(f"\n  Word count trung bình (label 1): {train_df[train_df['label']==1]['word_count'].mean():.1f}")
print(f"  Word count trung bình (label 0): {train_df[train_df['label']==0]['word_count'].mean():.1f}")

print("\n" + "=" * 60)
print("THỐNG KÊ TEST")
print("=" * 60)
print(f"  Tổng: {len(test_df):,}")
print(test_df['label'].value_counts().to_string())

print("\n✅ Hoàn tất! Đã lưu train_clean.csv và test_clean.csv")
print("   (Cột word_count được giữ lại cho sample_weight trong model)")
