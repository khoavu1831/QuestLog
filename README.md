# QuestLog - Developer Run Guide

Hệ thống QuestLog gồm 3 thành phần chính: **Frontend (React/Vite)**, **Backend (ASP.NET Core API)**, và **AI Service (Python Flask)**. Dưới đây là cách khởi chạy chúng.

---

### 1. 🟢 AI Service (Mô hình học máy - Phân tích Review)
*Xử lý tác vụ tính toán Helpful/Not Helpful.*

- Cần cài đặt Python (và có thể là môi trường ảo `venv`).
```bash
cd ai_service
pip install -r requirements.txt
python app.py
```
> URL hoạt động: `http://localhost:5001`

---

### 2. 🔵 Backend API (ASP.NET Core + MySQL)
*Serve dữ liệu cho frontend, kết nối Database và gọi AI Service.*

- Yêu cầu MySQL Server đang chạy và đổi chuỗi kết nối trong `appsettings.json` nếu cần.
```bash
cd backend
dotnet build
dotnet ef database update  # (Tuỳ chọn: Nếu chưa áp dụng migration)
dotnet run
```
> - Server hoạt động: `http://localhost:5000`
> - Tự động migrate và nhập dữ liệu (seed) DB từ file JSON khi chưa có data.

---

### 3. 🟡 Frontend (React + Vite)
*Giao diện người dùng tương tác hiển thị.*

- Đảm bảo đã có Node.js cài trên máy.
```bash
cd frontend
npm install
npm run dev
```
> URL hoạt động: `http://localhost:5173` (Tất cả lời gọi `/api/*` sẽ tự động chuyển hướng - proxy về `http://localhost:5000`).

---

### 🚀 Quy trình khởi chạy ưu tiên (Tốt nhất)
**MySQL Server** -> **AI Service (Port 5001)** -> **Backend (Port 5000)** -> **Frontend (Port 5173)**.
