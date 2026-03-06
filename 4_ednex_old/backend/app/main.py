from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv(override=True)

from app.api import router

app = FastAPI(title="Student Success API", version="0.1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    from sqlmodel import SQLModel, Session, select
    from sqlalchemy import text, inspect
    from app.auth import engine
    from app.models import Tutor
    
    try:
        SQLModel.metadata.create_all(engine)
        
        # Simple migration: Add missing columns to 'user' table if they don't exist
        inspector = inspect(engine)
        existing_columns = [c["name"] for c in inspector.get_columns("user")]
        
        with engine.connect() as conn:
            columns_to_add = [
                ("full_name", "VARCHAR"),
                ("gpa", "FLOAT"),
                ("on_track_score", "INTEGER")
            ]
            for col_name, col_type in columns_to_add:
                if col_name not in existing_columns:
                    try:
                        conn.execute(text(f'ALTER TABLE "user" ADD COLUMN {col_name} {col_type}'))
                        conn.commit()
                        print(f"Successfully added column {col_name} to user table")
                    except Exception as e:
                        print(f"Error adding column {col_name}: {e}")
                        continue
        
        # Seed Tutors
        with Session(engine) as session:
            sample_tutors = [
                Tutor(name="Alex Rivera", subjects="Calculus, Physics", rating=4.9, reviews=124, image="AR", color="#4f46e5"),
                Tutor(name="Sarah Chen", subjects="Chemistry, Biology", rating=4.8, reviews=89, image="SC", color="#10b981"),
                Tutor(name="Marcus Bell", subjects="History, English", rating=5.0, reviews=215, image="MB", color="#f59e0b"),
                Tutor(name="Elena Frost", subjects="Computer Science, Data Structures", rating=4.7, reviews=56, image="EF", color="#ec4899"),
                Tutor(name="David Park", subjects="Economics, Statistics", rating=4.9, reviews=92, image="DP", color="#8b5cf6"),
                Tutor(name="Maya Gupta", subjects="Psychology, Sociology", rating=4.8, reviews=156, image="MG", color="#f43f5e"),
                Tutor(name="Jordan Smith", subjects="Art History, Design", rating=4.6, reviews=43, image="JS", color="#06b6d4"),
                Tutor(name="Sam Wilson", subjects="Political Science, Law", rating=5.0, reviews=188, image="SW", color="#f97316"),
            ]
            
            for t in sample_tutors:
                statement = select(Tutor).where(Tutor.name == t.name)
                existing = session.exec(statement).first()
                if not existing:
                    session.add(t)
            session.commit()
            print("Database initialization complete")
    except Exception as e:
        print(f"Startup error: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to Student Success API"}

@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables"""
    import os
    return {
        "GOOGLE_API_KEY": "SET" if os.getenv("GOOGLE_API_KEY") else "NOT SET",
        "DATABASE_URL": "SET" if os.getenv("DATABASE_URL") else "NOT SET",
        "CANVAS_API_TOKEN": "SET" if os.getenv("CANVAS_API_TOKEN") else "NOT SET"
    }

app.include_router(router, prefix="/api")

# Register EdNex API
from app.ednex import ednex_router
app.include_router(ednex_router, prefix="/api/ednex", tags=["EdNex Hybrid Staging"])
