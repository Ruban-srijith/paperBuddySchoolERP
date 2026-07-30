-- ============================================================
-- SCHOOL MANAGEMENT SYSTEM — POSTGRESQL SCHEMA (v2)
-- Fixes vs. draft: conflict-free timetabling, lab_submissions,
-- classrooms, indexes, email status/dedup, auto-completion trigger
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. USERS & ROLES
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- 2. CLASSES, SUBJECTS & CLASSROOMS
-- ------------------------------------------------------------
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    UNIQUE(grade, section)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- NEW: was referenced in the original architecture diagram but never defined.
-- Needed to detect room-level double-booking, not just teacher/class clashes.
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,     -- e.g. 'Room 204', 'Chem Lab 1'
    capacity INT,
    is_lab BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------
-- 3. SYLLABUS NODES (drives Smart Portion Tracking)
-- ------------------------------------------------------------
CREATE TABLE syllabus_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_name VARCHAR(150) NOT NULL,
    topic_name VARCHAR(200) NOT NULL,
    weightage_percent NUMERIC(5, 2) DEFAULT 0.00
        CHECK (weightage_percent >= 0 AND weightage_percent <= 100),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_syllabus_subject ON syllabus_nodes(subject_id);

-- ------------------------------------------------------------
-- 4. TIMETABLE — now actually conflict-free
-- ------------------------------------------------------------
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    day_of_week VARCHAR(10) NOT NULL,   -- 'Monday' ... 'Saturday'
    time_slot VARCHAR(20) NOT NULL,     -- '09:00-10:00'

    -- A teacher can't be in two places in the same slot
    UNIQUE(teacher_id, day_of_week, time_slot),
    -- A class can't have two lessons in the same slot
    UNIQUE(class_id, day_of_week, time_slot),
    -- A room can't host two classes in the same slot
    UNIQUE(classroom_id, day_of_week, time_slot)
);

CREATE INDEX idx_timetables_teacher ON timetables(teacher_id);
CREATE INDEX idx_timetables_class ON timetables(class_id);

-- ------------------------------------------------------------
-- 5. ATTENDANCE
-- NOTE: this is DAILY (one record/student/day), not per-period.
-- If you need per-subject attendance instead, add a
-- timetable_id/period reference and change the UNIQUE constraint
-- to (student_id, date, timetable_id).
-- ------------------------------------------------------------
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    marked_by UUID REFERENCES users(id) ON DELETE SET NULL, -- teacher who took attendance
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL,
    UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_attendance_student ON attendance(student_id);

-- ------------------------------------------------------------
-- 6. DAILY WORK LOGS (feeds Smart Portion calculation)
-- ------------------------------------------------------------
CREATE TABLE daily_work_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    syllabus_node_id UUID REFERENCES syllabus_nodes(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worklogs_teacher_date ON daily_work_logs(teacher_id, date);
CREATE INDEX idx_worklogs_syllabus_node ON daily_work_logs(syllabus_node_id);

-- NEW: auto-mark a syllabus node complete the moment a teacher logs work
-- against it. This is what actually drives the progress bar — without it,
-- is_completed has to be toggled manually somewhere else in the app.
CREATE OR REPLACE FUNCTION mark_syllabus_node_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.syllabus_node_id IS NOT NULL THEN
        UPDATE syllabus_nodes
        SET is_completed = TRUE,
            completed_at = CURRENT_TIMESTAMP
        WHERE id = NEW.syllabus_node_id
          AND is_completed = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mark_syllabus_completed
AFTER INSERT ON daily_work_logs
FOR EACH ROW
EXECUTE FUNCTION mark_syllabus_node_completed();

-- ------------------------------------------------------------
-- 7. LAB ASSIGNMENTS + SUBMISSIONS
-- ------------------------------------------------------------
CREATE TABLE lab_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_assignments_class ON lab_assignments(class_id);

-- NEW: was referenced in the architecture doc but never defined.
-- Needed for the "submission status badge" feature to have anything to show.
CREATE TYPE submission_status AS ENUM ('not_submitted', 'submitted', 'late', 'graded');

CREATE TABLE lab_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_assignment_id UUID REFERENCES lab_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT,
    status submission_status NOT NULL DEFAULT 'not_submitted',
    submitted_at TIMESTAMP WITH TIME ZONE,
    grade NUMERIC(5,2),
    feedback TEXT,
    UNIQUE(lab_assignment_id, student_id)
);

CREATE INDEX idx_lab_submissions_assignment ON lab_submissions(lab_assignment_id);
CREATE INDEX idx_lab_submissions_student ON lab_submissions(student_id);

-- Auto-flag late submissions relative to the assignment's due_date
CREATE OR REPLACE FUNCTION flag_late_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_due_date TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT due_date INTO v_due_date FROM lab_assignments WHERE id = NEW.lab_assignment_id;
    IF NEW.submitted_at IS NOT NULL AND NEW.submitted_at > v_due_date THEN
        NEW.status := 'late';
    ELSIF NEW.submitted_at IS NOT NULL THEN
        NEW.status := 'submitted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flag_late_submission
BEFORE INSERT OR UPDATE ON lab_submissions
FOR EACH ROW
EXECUTE FUNCTION flag_late_submission();

-- ------------------------------------------------------------
-- 8. EMAIL LOGS — with status + dedup key
-- ------------------------------------------------------------
CREATE TYPE email_status AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body_summary TEXT,
    event_type VARCHAR(50),        -- e.g. 'timetable_updated', 'lab_assigned'
    related_id UUID,               -- id of the row that triggered this email
    dedup_key VARCHAR(255) UNIQUE, -- e.g. event_type || related_id || recipient_email
    status email_status NOT NULL DEFAULT 'queued',
    retry_count INT NOT NULL DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_status ON email_logs(status);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
