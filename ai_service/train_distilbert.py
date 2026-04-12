"""
train_distilbert.py
===================
Training script cho DistilBERT fine-tuning phân loại review hữu ích.
Chạy trên Kaggle GPU (T4 16GB hoặc P100 16GB).

Yêu cầu Kaggle:
  - Settings → Accelerator → GPU T4 x2 (hoặc T4 x1 đều được)
  - Packages cần: transformers, torch (đã có sẵn trên Kaggle)

Cấu hình tối ưu cho T4 16GB:
  - MAX_LEN = 256     : 512 max nhưng 256 đủ và nhanh gấp đôi
  - BATCH_SIZE = 32   : fit trong ~8GB VRAM với fp16
  - EPOCHS = 3        : chuẩn mực fine-tuning BERT, >3 dễ overfit
  - fp16 = True       : Tensor Core của T4 → ~2x speedup
  - lr = 2e-5         : "golden rule" cho BERT fine-tuning
  - warmup_ratio=0.1  : warm up 10% đầu để weight không bị shock
"""

import os
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, confusion_matrix
)

# =====================================================================
# CẤU HÌNH
# =====================================================================
MODEL_NAME  = "distilbert-base-uncased"
MAX_LEN     = 256       # 256 đủ cho hầu hết gaming reviews, nhanh hơn 512
BATCH_SIZE  = 32        # T4 16GB + fp16 → batch 32 fit thoải mái (~8GB VRAM)
EPOCHS      = 3         # BERT fine-tuning chuẩn: 2-4 epochs
LR          = 2e-5      # "golden rule" của BERT fine-tuning
WARMUP      = 0.1       # warmup 10% steps đầu
WEIGHT_DECAY = 0.01
RANDOM_SEED = 42
OUTPUT_DIR  = "./distilbert_output"    # checkpoint lưu ở đây
SAVE_DIR    = "./distilbert_model"     # model cuối cùng lưu ở đây

# Reproducibility
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# Kiểm tra GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Sử dụng device: {device}")
if device.type == "cuda":
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# =====================================================================
# STEP 1: ĐỌC DATA
# =====================================================================
print("\n" + "=" * 60)
print("STEP 1: Đọc dữ liệu...")
print("=" * 60)

train_df = pd.read_csv("train_clean.csv").dropna(subset=['text', 'label'])
test_df  = pd.read_csv("test_clean.csv").dropna(subset=['text', 'label'])

print(f"  Train: {len(train_df):,} | Test: {len(test_df):,}")

# =====================================================================
# STEP 2: TOKENIZER
# =====================================================================
print("\nSTEP 2: Khởi tạo tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# =====================================================================
# STEP 3: PYTORCH DATASET
# =====================================================================
class ReviewDataset(Dataset):
    """
    Custom Dataset cho HuggingFace Trainer.
    Tokenize text khi __getitem__ được gọi để tiết kiệm memory.
    """
    def __init__(self, texts, labels, tokenizer, max_len):
        self.texts     = texts.reset_index(drop=True)
        self.labels    = labels.reset_index(drop=True).astype(int)
        self.tokenizer = tokenizer
        self.max_len   = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text  = str(self.texts[idx])
        label = int(self.labels[idx])

        encoding = self.tokenizer(
            text,
            max_length=self.max_len,
            padding='max_length',       # pad về đúng MAX_LEN
            truncation=True,            # cắt nếu quá dài
            return_tensors='pt'
        )

        return {
            'input_ids':      encoding['input_ids'].squeeze(0),
            'attention_mask': encoding['attention_mask'].squeeze(0),
            'labels':         torch.tensor(label, dtype=torch.long),
        }

train_dataset = ReviewDataset(train_df['text'], train_df['label'], tokenizer, MAX_LEN)
test_dataset  = ReviewDataset(test_df['text'],  test_df['label'],  tokenizer, MAX_LEN)

print(f"  Train dataset: {len(train_dataset):,} samples")
print(f"  Test dataset:  {len(test_dataset):,} samples")

# =====================================================================
# STEP 4: MODEL
# =====================================================================
print("\nSTEP 4: Tải DistilBERT pretrained...")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2,           # binary: 0 = NOT HELPFUL, 1 = HELPFUL
    id2label={0: "NOT HELPFUL", 1: "HELPFUL"},
    label2id={"NOT HELPFUL": 0, "HELPFUL": 1},
)
model.to(device)

# In số parameters để báo cáo
total_params = sum(p.numel() for p in model.parameters())
trainable    = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"  Total parameters:    {total_params:,}")
print(f"  Trainable:           {trainable:,}")

# =====================================================================
# STEP 5: METRICS FUNCTION
# =====================================================================
def compute_metrics(eval_pred):
    """
    Function này được Trainer gọi sau mỗi epoch để tính metrics.
    """
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)

    return {
        "accuracy":  accuracy_score(labels, preds),
        "precision": precision_score(labels, preds, zero_division=0),
        "recall":    recall_score(labels, preds, zero_division=0),
        "f1":        f1_score(labels, preds, zero_division=0),
    }

# =====================================================================
# STEP 6: TRAINING ARGUMENTS
# =====================================================================
# Tính số steps để set warmup
steps_per_epoch    = len(train_dataset) // BATCH_SIZE
total_train_steps  = steps_per_epoch * EPOCHS
warmup_steps       = int(total_train_steps * WARMUP)

print(f"\n  Steps/epoch: {steps_per_epoch:,}")
print(f"  Total steps: {total_train_steps:,}")
print(f"  Warmup steps: {warmup_steps:,}")

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,

    # ── Training loop ──────────────────────────────────────────
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE * 2,  # eval không cần gradient → batch lớn hơn

    # ── Optimizer ──────────────────────────────────────────────
    learning_rate=LR,
    weight_decay=WEIGHT_DECAY,
    warmup_steps=warmup_steps,
    lr_scheduler_type="linear",        # linear decay sau warmup

    # ── Speed & Memory (T4 optimization) ───────────────────────
    fp16=torch.cuda.is_available(),    # chỉ bật khi có GPU
    dataloader_num_workers=2,          # parallel data loading
    optim="adamw_torch",               # tốt hơn default 'adamw_hf'

    # ── Evaluation & Saving ────────────────────────────────────
    eval_strategy="epoch",             # đánh giá sau mỗi epoch
    save_strategy="epoch",
    load_best_model_at_end=True,       # restore best checkpoint khi xong
    metric_for_best_model="f1",        # dùng F1 để chọn best model
    greater_is_better=True,

    # ── Logging ────────────────────────────────────────────────
    logging_dir=f"{OUTPUT_DIR}/logs",
    logging_steps=100,                 # log mỗi 100 steps
    report_to="none",                  # tắt wandb/tensorboard

    # ── Reproducibility ────────────────────────────────────────
    seed=RANDOM_SEED,
)

# =====================================================================
# STEP 7: TRAINER
# =====================================================================
print("\nSTEP 6: Khởi tạo Trainer...")

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics,
    callbacks=[
        EarlyStoppingCallback(early_stopping_patience=2)
        # Dừng nếu F1 không cải thiện sau 2 epoch liên tiếp
    ],
)

# =====================================================================
# STEP 8: HUẤN LUYỆN
# =====================================================================
print("\nSTEP 7: Bắt đầu huấn luyện...")
print(f"  Ước tính thời gian trên T4: ~{EPOCHS * len(train_dataset) // (BATCH_SIZE * 60):.0f} phút")

trainer.train()

# =====================================================================
# STEP 9: ĐÁNH GIÁ CHI TIẾT
# =====================================================================
print("\nSTEP 8: Đánh giá chi tiết trên tập test...")

predictions = trainer.predict(test_dataset)
logits = predictions.predictions
y_pred = np.argmax(logits, axis=1)
y_test = test_df['label'].astype(int).values

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall    = recall_score(y_test, y_pred, zero_division=0)
f1        = f1_score(y_test, y_pred, zero_division=0)
cm        = confusion_matrix(y_test, y_pred)

print("\n" + "=" * 50)
print(" 4 ĐỘ ĐO ĐÁNH GIÁ — DistilBERT fine-tuned")
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
# STEP 10: LƯU MODEL
# =====================================================================
print(f"\nSTEP 9: Lưu model vào '{SAVE_DIR}'...")

model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)

print("✅ Đã lưu:")
print(f"   - {SAVE_DIR}/config.json")
print(f"   - {SAVE_DIR}/model.safetensors  (~260MB)")
print(f"   - {SAVE_DIR}/tokenizer files")
print(f"\n   Copy toàn bộ thư mục '{SAVE_DIR}/' vào ai_service/ để deploy")
