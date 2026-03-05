"""
Migration script to add LectureNote table
"""
from sqlmodel import SQLModel, Session, create_engine
from app.models import LectureNote
from app.auth import engine
import os

def migrate():
    print("Creating LectureNote table...")
    try:
        # Create the table
        SQLModel.metadata.create_all(engine, tables=[LectureNote.__table__])
        print("SUCCESS: LectureNote table created successfully!")
    except Exception as e:
        print(f"ERROR: Error creating table: {e}")

if __name__ == "__main__":
    migrate()
