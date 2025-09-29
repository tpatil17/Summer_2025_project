# 💸 AI-Powered Expense Tracker  

A full-stack **expense management app** built with **React + TypeScript + Firebase + OpenAI GPT-4o**.  
Track spending, scan receipts with OCR, auto-categorize expenses, and get AI-powered insights.  

---

## ✨ Features  

### 🔑 Core  
- Secure **Firebase Authentication** (Email/Password, Google)  
- Real-time **Firestore Database** for expenses & receipts  
- **Dashboard** with charts, totals, and monthly comparisons  
- **Delete flow**: remove receipts + related expenses in one atomic operation  

### 🧾 Expense & Receipt Ingestion  
- Manual expense entry form  
- **Receipt upload modal** (camera capture + drag & drop)  
- OCR via **Tesseract.js** to extract raw text  
- Receipt parser → structured expense data  

### 🤖 AI Integration (OpenAI GPT-4o)  
- `enrichParsedReceipt` Cloud Function with **function calling**  
- Adds **categories + quantities** to receipt items  
- Restricted to **10 fixed categories** (aligned with UI dropdowns):  
  1. Food & Dining  
  2. Housing & Utilities  
  3. Transportation  
  4. Health & Wellness  
  5. Entertainment & Leisure  
  6. Shopping & Retail  
  7. Travel & Vacations  
  8. Education & Learning  
  9. Finance & Insurance  
  10. Other  

### 🔐 Security  
- Firestore security rules scoped to **userId**  
- Protected **callable functions** (only authenticated users can call)  

---

## 📊 Dashboard Preview  
- Category-based expense breakdown (Recharts)  
- Monthly totals with last month comparison  
- Auto-refreshes on **add / edit / delete**  

---

## 🚀 Roadmap  

- **Dashboard Enhancements**  
  - Add cards for upcoming renewals + active alerts  
  - Improved category insights (month-over-month trends)  

- **Fraud Detection Engine (ML)**  
  - Train anomaly detection (Isolation Forest / Autoencoder)  
  - Flag suspicious expenses  

- **Expense Forecasting**  
  - Predict next month’s spend (Prophet / ARIMA / LSTM)  

- **AI Spending Insights**  
  - GPT-powered natural language summaries of spending patterns  

- **CI/CD & Polish**  
  - GitHub Actions for deploys  
  - Secrets management for Firebase + OpenAI  
  - Unit tests & improved UI/UX  

---

## 🛠️ Getting Started  

### 1. Clone the Repository  
```bash
git clone https://github.com/tpatil17/Summer_2025_project.git

# Frontend
cd frontend
npm install

# Functions
cd ../functions
npm install

VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
VITE_OPENAI_API_KEY=<your_openai_api_key>

cd functions
firebase functions:secrets:set OPENAI_API_KEY

# Optional: run Firebase emulator
firebase emulators:start

# Frontend dev server
cd frontend
npm run dev

# Deploy functions
cd functions
npm run build
firebase deploy --only functions

# Deploy frontend
cd frontend
npm run build
firebase deploy --only hosting

git checkout -b feature/my-feature

git commit -m "Add new feature"

