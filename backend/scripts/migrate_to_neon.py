import sys
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import create_engine, text, update
from sqlalchemy.orm import sessionmaker

# Add backend dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import Base
from app.db import models

async def main():
    sqlite_url = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'school_erp.db'))}"
    sqlite_engine = create_engine(sqlite_url)
    
    neon_sync_url = "postgresql://neondb_owner:npg_43KzlIaJDiFc@ep-muddy-king-az2d4z8v.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    neon_sync_engine = create_engine(neon_sync_url)
    
    # We will use this hardcoded order to avoid constraint issues.
    ordered_tables = [
        'schools', 'departments', 'users', 'classes', 'subjects', 'classrooms', 
        'syllabus_nodes', 'timetables', 'students', 'mentor_assignments', 'attendance', 
        'daily_work_logs', 'lab_assignments', 'lab_submissions', 'email_logs', 'mentor_logs', 
        'fee_payments', 'parent_student_map', 'leave_requests', 'teacher_substitutions', 
        'bus_routes', 'academic_calendar_events', 'salary_records', 'school_event_proposals', 
        'exam_schedules', 'homeworks', 'assignments', 'student_queries', 'announcements', 
        'scan_records', 'fee_structures', 'department_budgets', 'vendors', 'fee_transactions', 
        'payroll', 'hostel_rooms', 'hostel_assignments', 'outpasses', 'financial_requests', 
        'expenses', 'scholarships', 'hostel_attendance', 'incident_reports', 'visitor_logs', 
        'library_books', 'library_requests', 'library_digital_resources', 'library_issues', 
        'transport_vehicles', 'transport_routes', 'transport_stops', 'transport_staff', 'transport_students'
    ]
    
    print("Starting data migration...")
    
    with sqlite_engine.connect() as sqlite_conn:
        with neon_sync_engine.begin() as neon_conn:
            
            # Clear existing data to allow re-runs
            for t_name in reversed(ordered_tables):
                neon_conn.execute(text(f'TRUNCATE TABLE "{t_name}" CASCADE;'))
                
            department_deans = {}
            
            for t_name in ordered_tables:
                table = Base.metadata.tables[t_name]
                print(f"Migrating table: {table.name}...")
                
                rows = sqlite_conn.execute(table.select()).fetchall()
                if not rows:
                    print(f" -> 0 rows in {table.name}")
                    continue
                    
                dicts = [dict(row._mapping) for row in rows]
                
                # Break the cycle by temporarily removing dean_id
                if t_name == 'departments':
                    for d in dicts:
                        department_deans[d['id']] = d.get('dean_id')
                        d['dean_id'] = None
                        
                # Insert rows one by one to gracefully skip orphaned records (common in SQLite without FK enforcement)
                from sqlalchemy.exc import IntegrityError
                inserted_count = 0
                for row_dict in dicts:
                    try:
                        # Using a sub-transaction (savepoint) for each row
                        with neon_conn.begin_nested():
                            neon_conn.execute(table.insert(), [row_dict])
                        inserted_count += 1
                    except IntegrityError as e:
                        print(f"    Skipping orphaned row in {table.name}: {e._message()}")
                        
                print(f" -> Inserted {inserted_count}/{len(dicts)} rows into {table.name}")
                
            # Restore dean_id for departments
            if department_deans:
                departments_table = Base.metadata.tables['departments']
                for dep_id, dean_id in department_deans.items():
                    if dean_id is not None:
                        stmt = update(departments_table).where(departments_table.c.id == dep_id).values(dean_id=dean_id)
                        neon_conn.execute(stmt)
                print(f" -> Restored dean_ids for departments")

    print("Data Migration Complete! All records moved to Neon DB.")

if __name__ == "__main__":
    asyncio.run(main())
