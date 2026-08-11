# `fkf-ems` - Enterprise Online Loan Management System

`fkf-ems` is a cloud-native, multi-branch Online Loan Management System designed for microfinance institutions and financial services organizations.

## Key Features

1. **Role-Based Access Control (RBAC) & Cloud Isolation**:
   - Roles: IT/Super Admin, Branch Manager, Loan Officer, Risk Officer.
   - Dynamic branch-level data scoping for branch staff, with cross-branch global oversight for HQ Super Admins.
   - Built-in live RBAC Quick Switcher for instant role preview.

2. **Dynamic Branch Parameter Configuration**:
   - Central IT/Super Admin control panel.
   - Branch-specific operational parameters: Max loan amount caps, base interest rates, late penalty calculation rules (Flat rate vs. Percentage-based), collateral requirements, and minimum Loan-to-Value (LTV) limits.

3. **Profit & Loss (P&L) Financial Engine**:
   - Automatic financial segregation per branch tracking Income (interest collected, processing fees, late penalties) and Losses (bad debt write-offs, NPL provisions).
   - Recharts visual analytics (Branch Profitability Leaderboard & Revenue/Loss Composition charts).
   - Date range statement filters and instant PDF/Excel exports.

4. **Advanced Collateral Tracking & Alert Center**:
   - Collateral asset cataloging (Vehicles, Land Titles, Commercial Real Estate, Equipment).
   - Dynamic Loan-to-Value (LTV) ratio calculation engine.
   - Ownership title deed & logbook PDF reference attachment.
   - Real-time warnings & alerts for expiring insurance policies (&lt; 30 days) and high LTV violations (&gt; 75%).

5. **Live CRB Integration Engine**:
   - Live integration harness with production-grade API payload maps for **Creditinfo Kenya** and **Metropol CRB**.
   - Automated credit score evaluation (200-900) and defaulter risk flagging.

---

## Local Setup & Quickstart

### Backend Setup (Django API)
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations branches authentication loans collateral analytics crb
python manage.py migrate
python seed_data.py
python manage.py runserver 8000
```

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open browser at `http://localhost:3000`.

---

## Cloud Deployment Architecture

- **Frontend**: Configured for deployment on Vercel (`frontend/vercel.json`).
- **Backend API**: Configured for deployment on Render / DigitalOcean (`backend/render.yaml` & `backend/Procfile`).
- **Database**: Production PostgreSQL configuration ready via `DATABASE_URL`.
