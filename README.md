# Job Fraud Detection System - Anveshan Hackathon 2025

## Team: **Numeric Nomads**

Video Link : [google-drive link](https://drive.google.com/file/d/1ZSjYRno66MqTZnd_2gwVcISKOlhzRm_F/view)

**Members:**

* Bhawesh Agrawal
* Priyanka Singh (Team Lead)

---

## Project Presentation
[`https://drive.google.com/file/d/1ZSjYRno66MqTZnd_2gwVcISKOlhzRm_F/view?usp=drive_link`]

## 📋 Project Overview

A **Job Fraud Detection System** that allows users to check if a job posting is likely fraudulent.

**Tech Stack Used:**

* Backend: FastAPI, Scikit-learn, PyTorch
* Frontend: Next.js (React), TailwindCSS
* Machine Learning: Stacking Classifier (Logistic Regression, Random Forest, LGBM)

---

## 📁 Project Structure

```
June Hackathon/
│
├── main.py               # FastAPI Backend Entry Point
├── requirements.txt      # Backend Dependencies
│
└── frontend/
    └── jobbot/          # Next.js Frontend App
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── app/
                └── page/
                    ├── (multiple folders/files here for each page)
```

---

## ⚙️ Setup Instructions (Local Machine)

### 1. Clone the Repository

```bash
git clone [<repository-link>](https://github.com/Bhawesh-Agrawal/Numeric-Nomads)
cd June\ Hackathon
```

---

### 2. Backend Setup (FastAPI)

#### a) Create & Activate a Virtual Environment:

For **Windows**:
Make sure python 3.12 is installed in your setup.

```bash
python3.12 -m venv venv
venv\Scripts\activate
```

For **Linux/Mac**:

```bash
python3.12 -m venv venv
source venv/bin/activate
```

#### b) Install Required Packages:

```bash
pip install -r requirements.txt
```

#### c) Run FastAPI Server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

FastAPI Backend will now run at:
👉 `http://localhost:8000`

---

### 3. Frontend Setup (Next.js)

#### a) Go to Frontend Folder:

```bash
cd frontend/jobbot
```

#### b) Install Dependencies:

```bash
npm install
```

#### c) Change API URLs:

**IMPORTANT:**
Go to each API calling file inside:

```
frontend/jobbot/src/app/page/...(files)
```

and **replace the cloud URLs with your local FastAPI server** URL:

```javascript
http://localhost:8000
```

Do this wherever API requests are made (GET, POST, etc.).

#### d) Run Next.js Frontend:

```bash
npm run dev
```

Next.js Frontend will now run at:
👉 `http://localhost:3000`

---

### 4. Open the App:

* Backend: [http://localhost:8000](http://localhost:8000)
* Frontend: [http://localhost:3000](http://localhost:3000)

✅ You're all set to use the **Job Fraud Detection System** locally!

---

## 🚀 Our Process:

1. **Problem Definition:**
   Detect potential fraudulent job postings using machine learning.

2. **Model Development:**
   Trained a Stacking Classifier combining:

   * Logistic Regression
   * Random Forest
   * LightGBM
     with TF-IDF feature extraction.

3. **Backend:**
   FastAPI serves the trained model to make real-time predictions.

4. **Frontend:**
   Next.js-powered modern UI where users can:

   * Search for jobs
   * Check fraud probability
   * View detailed job descriptions

5. **Integration:**
   API endpoints from FastAPI consumed in Next.js app for seamless interaction.

6. **Real Time Job:**
   FastAPI also tracks real time job and calcualtes its fraud probability in real time.

---

## 👨‍💻 Done By:

| Name            | Role      |
| --------------- | --------- |
| Bhawesh Agrawal | Developer |
| Priyanka Singh  | Team Lead |

**Team Name:** Numeric Nomads
**Hackathon:** Anveshan Hackathon 2025

---
