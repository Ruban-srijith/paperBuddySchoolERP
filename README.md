# Paperbuddy School ERP

Paperbuddy School ERP is a modern, full-stack educational resource planning application designed to seamlessly manage school operations. It provides comprehensive role-based access for administrators, teachers, and students, and streamlines everyday tasks like conflict-free timetabling, smart portion tracking, lab submissions, and daily attendance.

## 🌟 Key Features

* **Role-Based Access Control:** Distinct portals and permissions for `admin`, `teacher`, and `student` roles.
* **Smart Portion Tracking:** Automatically tracks syllabus progress when teachers submit their daily work logs.
* **Conflict-Free Timetabling:** Built using advanced constraint solvers (Google OR-Tools) to ensure teachers and classrooms are never double-booked.
* **Attendance Management:** Daily student attendance tracking with quick reporting.
* **Lab Assignments & Submissions:** Manage homework and lab work with automatic flagging for late submissions.
* **Automated Notifications:** Email queue system for alerts like timetable updates or new lab assignments.

---

## 🏗️ Architecture & Technology Stack

The project uses a decoupled architecture with a FastAPI backend and a Next.js frontend.

### Frontend
* **Framework:** Next.js 14 (App Router) & React 18
* **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`
* **State Management:** Zustand
* **API Client:** Axios
* **Icons:** Lucide React
* **Language:** TypeScript

### Backend
* **Framework:** FastAPI (Python)
* **Database & ORM:** PostgreSQL (Production) / SQLite (Development) with SQLAlchemy (Async)
* **Validation:** Pydantic
* **Optimization Algorithms:** Google OR-Tools
* **Security:** JWT Authentication (Python-Jose), Bcrypt Password Hashing (Passlib)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **PNPM** (recommended for the frontend workspace)
- **Python** (v3.9 or higher)
- **PostgreSQL** (if running the full database schema in production, otherwise SQLite is used locally)

---

## 🚀 How to Run the Project Locally

Follow these steps to set up and run the Paperbuddy School ERP on your local development environment.

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

**Create and activate a virtual environment:**
```bash
# For Windows
python -m venv venv
venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Run the FastAPI server:**
```bash
uvicorn app.main:app --reload
```
The backend API will be available at: [http://localhost:8000](http://localhost:8000) (Docs available at `/docs`).

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

**Install dependencies:**
Using pnpm (recommended as per `pnpm-lock.yaml`):
```bash
pnpm install
```
*(Alternatively, you can use `npm install`)*

**Run the Next.js development server:**
```bash
pnpm run dev
# or npm run dev
```
The frontend application will be available at: [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Schema & Seeding

The core database schema is defined in the root `schema.sql` file. For local development, the FastAPI backend uses SQLite (`school_erp.db`) and auto-generates tables on startup. 

If you want to seed the local database with initial test data, run the seed script from the `backend` directory:

```bash
cd backend
python seed_data.py
```

---

## 📄 License

This project is licensed under the ISC License - see the `package.json` for details.
