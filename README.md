# HR Management System

A full-stack employee management app: React (Next.js) frontend + FastAPI backend,
with role-based access control, department tracking, and attendance.

## Stack

- **Frontend:** React.js / Next.js, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** SQLite by default (zero setup) — swap to PostgreSQL by setting `DATABASE_URL`
- **Auth:** JWT-based login with three roles — `admin`, `manager`, `employee`

## Features

- Employee directory with add / edit / deactivate / remove (role-gated)
- Department management with live employee counts
- Attendance marking and history, scoped per role:
  - **Employees** can only mark and view their own attendance
  - **Managers/Admins** can mark attendance for anyone and see everyone's records
  - **Admins** can delete employees and departments; **managers** can create/edit
- Dashboard overview with today's attendance snapshot
- Clean, purpose-built UI (not a generic template) — dark sidebar, ledger-style
  typography, status colour coding

## Project structure

```
hr-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # Employee, Department, Attendance
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── auth.py            # Password hashing + JWT
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── employees.py
│   │       ├── departments.py
│   │       └── attendance.py
│   ├── seed_data.py           # Demo data + login credentials
│   └── requirements.txt
└── frontend/
    ├── pages/                 # index (login), dashboard, employees, departments, attendance
    ├── components/Layout.js
    ├── lib/                   # api.js (fetch wrapper), AuthContext.js
    └── styles/globals.css
```

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt

python3 seed_data.py            # creates hr_management.db with demo data
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points the frontend at the backend URL
npm run dev
```

Open `http://localhost:3000`.

## Demo logins (created by `seed_data.py`)

| Role     | Email                     | Password      |
|----------|----------------------------|--------------|
| Admin    | admin@hrms.com              | admin123     |
| Manager  | rohan.kapoor@hrms.com       | manager123   |
| Employee | neha.verma@hrms.com         | employee123  |

There are also 5 more seeded employees you can log in as (all with password `employee123`
or `manager123` — see `seed_data.py` for the full list).

## Switching to PostgreSQL

The app runs on SQLite out of the box for a zero-config demo. To use PostgreSQL instead:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/hr_management"
```

No code changes needed — SQLAlchemy handles both. Install `psycopg2-binary` if you go this route.

## Notes for your resume / interviews

- Role-based access is enforced **server-side** on every write endpoint (not just hidden
  in the UI), so it's a real access-control implementation, not cosmetic.
- Passwords are hashed with bcrypt; sessions use signed JWTs.
- The schema is normalized: `employees` → `departments` (FK), `attendance` → `employees` (FK),
  matching what your resume already describes.
- SQLite-by-default / Postgres-by-env-var is a common real-world pattern worth mentioning if asked
  about the DB choice.
