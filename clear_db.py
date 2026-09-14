import sqlite3
import os

db_path = "backend/school_erp.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# We delete all documents other than Aadhaar so the user can re-upload them!
c.execute("DELETE FROM student_documents WHERE document_type != 'aadhaar';")
conn.commit()
conn.close()
print("Cleared non-Aadhaar documents so they can be freshly uploaded!")
