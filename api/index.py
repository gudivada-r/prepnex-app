from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Create a minimal FastAPI app
app = FastAPI(title="Student Success API - Minimal")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FORCE TABLE CREATION ON VERCEL LOAD (for /tmp/database.db)
try:
    from sqlmodel import SQLModel
    from app.auth import engine
    from app.models import User, Course # models must be imported!
    print("Attempting to create tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")
    
    # MIGRATION FIX: Ensure 'user' table has all columns
    from sqlalchemy import text, inspect
    inspector = inspect(engine)
    if inspector.has_table("user"):
        existing_columns = [c["name"] for c in inspector.get_columns("user")]
        columns_to_add = [
            ("full_name", "VARCHAR"),
            ("gpa", "FLOAT"),
            ("on_track_score", "INTEGER"),
            ("major", "VARCHAR"),
            ("background", "VARCHAR"),
            ("interests", "VARCHAR"),
            ("ai_insight", "VARCHAR")
        ]
        with engine.connect() as conn:
            for col_name, col_type in columns_to_add:
                if col_name not in existing_columns:
                    try:
                        print(f"Migrating: Adding {col_name} to user table...")
                        conn.execute(text(f'ALTER TABLE "user" ADD COLUMN {col_name} {col_type}'))
                        conn.commit()
                    except Exception as me:
                        print(f"Migration error for {col_name}: {me}")

except Exception as e:
    print(f"Failed to create tables or migrate on import: {e}")

@app.get("/")
def root():
    return {"message": "API is running", "env_check": {
        "GOOGLE_API_KEY": "present" if os.getenv("GOOGLE_API_KEY") else "missing",
        "DATABASE_URL": "present" if os.getenv("DATABASE_URL") else "missing"
    }}

@app.get("/api/")
def api_root():
    # Ensure tables exist (crucial for Vercel /tmp SQLite)
    from sqlmodel import SQLModel
    from app.auth import engine
    try:
        SQLModel.metadata.create_all(engine)
        table_status = "Tables created/verified."
    except Exception as e:
        table_status = f"Table creation failed: {e}"
        
    return {"message": "API entry point is live", "db_status": table_status}

@app.get("/api/debug")
def debug():
    import sys
    return {
        "sys.path": sys.path,
        "env": {k: "set" for k in os.environ.keys() if "API" in k or "URL" in k or "KEY" in k},
        "cwd": os.getcwd()
    }

@app.get("/api/test-gemini")
def test_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "GOOGLE_API_KEY is missing from environment"}
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Ping")
        return {"status": "success", "response": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/test-db")
def test_db():
    try:
        from app.auth import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
        return {"status": "success", "result": result, "engine_url": str(engine.url).split("://")[0] + "://***"}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}

# Try to import the full backend
BACKEND_LOADED = False
BACKEND_ERROR = None

try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    backend_dir = os.path.join(root_dir, "backend")
    
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    from backend.app.main import app as backend_app
    from backend.app.api import router
    
    # Mount the backend routes
    app.include_router(router, prefix="/api")
    
    BACKEND_LOADED = True
    print("✓ Successfully loaded backend")
except Exception as e:
    BACKEND_ERROR = str(e)
    print(f"✗ Backend import failed: {e}")
    import traceback
    traceback.print_exc()

@app.get("/api/migrate")
def manual_migrate():
    log = []
    try:
        from app.auth import engine
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        if inspector.has_table("user"):
            existing_columns = [c["name"] for c in inspector.get_columns("user")]
            columns_to_add = [
                ("full_name", "VARCHAR"),
                ("gpa", "FLOAT"),
                ("on_track_score", "INTEGER"),
                ("major", "VARCHAR"),
                ("background", "VARCHAR"),
                ("interests", "VARCHAR"),
                ("ai_insight", "VARCHAR")
            ]
            with engine.connect() as conn:
                for col_name, col_type in columns_to_add:
                    if col_name not in existing_columns:
                        try:
                            conn.execute(text(f'ALTER TABLE "user" ADD COLUMN {col_name} {col_type}'))
                            conn.commit()
                            log.append(f"Added column {col_name}")
                        except Exception as e:
                            log.append(f"Error adding {col_name}: {str(e)}")
                    else:
                        log.append(f"Column {col_name} exists")
        else:
            log.append("User table NOT found.")
            
        return {"status": "success", "log": log}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}

@app.get("/api/status")
def status():
    return {
        "api_entry": "live",
        "backend_loaded": BACKEND_LOADED,
        "backend_error": BACKEND_ERROR
    }

if not BACKEND_LOADED:
    @app.post("/api/auth/login")
    def login_fallback():
        from fastapi import HTTPException
        import traceback
        
        error_details = {
            "message": "Backend failed to load",
            "backend_error": BACKEND_ERROR,
            "solution": "Check Vercel deployment logs and ensure all dependencies are installed"
        }
        
        print(f"Login attempt failed - Backend not loaded: {BACKEND_ERROR}")
        
        raise HTTPException(
            status_code=503,  # Service Unavailable is more appropriate than 500
            detail=error_details
        )
    
    @app.get("/api/backend-status")
    def backend_status():
        """Diagnostic endpoint to check backend loading status"""
        import sys
        return {
            "backend_loaded": BACKEND_LOADED,
            "backend_error": BACKEND_ERROR,
            "python_version": sys.version,
            "sys_path": sys.path[:3],  # First 3 paths for brevity
            "environment": {
                "has_database_url": bool(os.getenv("DATABASE_URL")),
                "has_google_api_key": bool(os.getenv("GOOGLE_API_KEY"))
            }
        }

