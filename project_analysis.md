# Paperbuddy School ERP - Project Analysis

## 1. Project Overview
**Paperbuddy School ERP** is a comprehensive full-stack application designed to manage school operations. It provides role-based access for admins, teachers, and students, with features like conflict-free timetabling, smart portion (syllabus) tracking, lab assignments, attendance, and email notifications.

## 2. Architecture & Technology Stack

The project follows a modern decoupled architecture with a frontend web application and a backend API server, communicating likely via REST over HTTP.

### **Backend (Python / FastAPI)**
- **Framework:** FastAPI (high-performance async web framework)
- **Database ORM:** SQLAlchemy (async with `asyncpg` for PostgreSQL and `aiosqlite` for local/testing SQLite)
- **Validation:** Pydantic & Pydantic Settings
- **Algorithms:** OR-Tools (Google's optimization tools, likely used for the conflict-free timetabling generation)
- **Security:** Python-Jose (JWT tokens), Passlib (Bcrypt for password hashing)
- **Utilities:** Python-Multipart (for file uploads), Jinja2 (likely for email templates), Requests.

### **Frontend (React / Next.js)**
- **Framework:** Next.js 14 (App Router expected given the structure)
- **UI Library:** React 18
- **Styling:** Tailwind CSS with PostCSS & Autoprefixer, `clsx` and `tailwind-merge` for dynamic class utility.
- **State Management:** Zustand (lightweight and unopinionated)
- **Networking:** Axios
- **Icons:** Lucide React
- **Language:** TypeScript

## 3. Database Schema (PostgreSQL)

The database schema (`schema.sql`) represents a robust relational data model focusing heavily on educational workflow and operational constraints.

### Core Entities:
- **Users & Roles:** Supports `admin`, `teacher`, and `student` roles (`users` table).
- **Classes, Subjects & Classrooms:** Defines the academic structure. Classrooms include capacity and lab designations.
- **Syllabus Nodes:** Granular tracking of chapters and topics with weightages. Allows for "Smart Portion Tracking."
- **Timetables:** Designed to be **conflict-free**. It enforces strict uniqueness constraints to ensure:
  - A teacher cannot be in two places at once.
  - A class cannot have two simultaneous lessons.
  - A room cannot host two classes simultaneously.
- **Attendance:** Daily attendance tracking per student (`present`, `absent`, `late`).
- **Daily Work Logs:** Teachers log what was taught, which automatically drives syllabus completion via a PostgreSQL trigger (`mark_syllabus_node_completed`).
- **Lab Assignments & Submissions:** Manages file-based assignments, submission statuses (`not_submitted`, `submitted`, `late`, `graded`), and automated late flagging via triggers.
- **Email Logs:** Asynchronous email queue table with statuses (`queued`, `sent`, `failed`) and deduplication mechanisms.

## 4. Project Structure

### Root Directory
- `/backend/` - Python backend codebase.
- `/frontend/` - Next.js frontend codebase.
- `schema.sql` - Main database initialization and schema definitions.
- `package.json` / `pnpm-lock.yaml` - Root workspace configuration (likely managed via pnpm workspaces or just standalone).

### Backend Structure (`/backend/app/`)
- `main.py`: Entry point for the FastAPI application.
- `api/`: API router and endpoint definitions.
- `core/`: Core configurations, security, and settings.
- `db/`: Database connection setups and session management.
- `schemas/`: Pydantic models for request/response validation.
- `services/`: Business logic, heavy lifting (like timetable generation), and DB operations.
- *Also contains a local SQLite DB (`school_erp.db`) and seed scripts (`seed_data.py`, `test_api.py`).*

### Frontend Structure (`/frontend/`)
- `src/app/`: Next.js 14 App Router pages and layouts.
- `src/components/`: Reusable React components (UI elements).
- `src/lib/`: Utility functions and Axios configurations.
- `src/store/`: Zustand state management stores.
- Standard configuration files: `tailwind.config.js`, `tsconfig.json`, `next.config.js`.

## 5. Key Highlights & Features
1. **Automated Tracking:** Smart triggers update the syllabus progress automatically when a teacher submits a daily work log.
2. **Algorithmic Timetabling:** The presence of `ortools` suggests the backend has the capability to algorithmically generate conflict-free timetables based on the strict constraints defined in the database.
3. **Robust Data Integrity:** Heavy use of Postgres constraints and triggers ensures data remains valid at the database level regardless of application bugs.
4. **Modern UI/UX:** The combination of Next.js, Tailwind CSS, and Zustand provides a foundation for a very fast, responsive, and maintainable user interface.
