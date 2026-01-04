from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

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
    from app.models import (
        User, Course, ChatSession, ChatMessage, Tutor, FormRequest, 
        Advisor, StudyGroup, Mentorship, MarketplaceItem, 
        LectureNote, StudentHold, Scholarship, PersonalizedStatement
    )
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

        # SEED USERS (Test Accounts) - Critical for Vercel
        try:
            from app.auth import get_password_hash
            from sqlmodel import select, Session
            
            with Session(engine) as session:
                # 1. Student
                if not session.exec(select(User).where(User.email == "student@university.edu")).first():
                    print("Seeding student@university.edu...")
                    student = User(
                        email="student@university.edu",
                        password_hash=get_password_hash("student123"),
                        full_name="Alex Student",
                        gpa=3.8,
                        on_track_score=92,
                        is_admin=False
                    )
                    session.add(student)
                
                # 2. Faculty
                if not session.exec(select(User).where(User.email == "faculty@university.edu")).first():
                    print("Seeding faculty@university.edu...")
                    faculty = User(
                        email="faculty@university.edu",
                        password_hash=get_password_hash("faculty123"),
                        full_name="Dr. Sarah Faculty",
                        is_admin=False,
                        is_faculty=True
                    )
                    session.add(faculty)
                    
                # 3. Admin
                if not session.exec(select(User).where(User.email == "admin@university.edu")).first():
                    print("Seeding admin@university.edu...")
                    admin = User(
                        email="admin@university.edu",
                        password_hash=get_password_hash("admin123"),
                        full_name="System Admin",
                        is_admin=True
                    )
                    session.add(admin)
                
                session.commit()
                print("Seeding complete.")
        except Exception as seed_err:
            print(f"Seeding failed: {seed_err}")


except Exception as e:
    print(f"Failed to create tables or migrate on import: {e}")

@app.get("/api/debug-routes")
def debug_routes():
    """List all registered routes to verify mounting"""
    import inspect
    routes = []
    for route in app.routes:
        methods = ", ".join(route.methods) if hasattr(route, "methods") else "None"
        routes.append(f"{route.path} [{methods}]")
    return {"registered_routes": routes}

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

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "backend_loaded": BACKEND_LOADED}

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
            # Try to get DB Name (works on Postgres)
            try:
                db_name = conn.execute(text("SELECT current_database()")).scalar()
            except:
                db_name = "Unknown (Not Postgres)"
                
        return {
            "status": "success", 
            "result": result, 
            "engine_url": "Postgres (Masked)",
            "connected_host": str(engine.url.host),
            "connected_db": str(db_name)
        }
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
    
    # CRITICAL: Pre-load auth module to ensure get_admin_user is defined before api.py imports it
    from backend.app import auth as _auth_preload
    
    from backend.app.main import app as backend_app
    from backend.app.api import router
    
    # Mount the backend routes
    app.include_router(router, prefix="/api")
    # Backup mount in case Vercel/FastAPI path stripping logic is misbehaving
    app.include_router(router, prefix="")
    
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

@app.get("/api/admin/seed_demo_g")
def seed_demo_user_g():
    """
    Seeds a rich demo user 'g@student.org' for App Store Review / Demo purposes.
    Includes: Courses (History/Planned), Holds, Alerts, Financials, etc.
    """
    try:
        from app.auth import engine, get_password_hash
        from sqlmodel import Session, select
        from app.models import (
            User, Course, StudentHold, Scholarship, MarketplaceItem, 
            Mentorship, StudyGroup
        )
        from datetime import datetime, timedelta

        log = []
        
        with Session(engine) as session:
            # 1. Create/Update User
            user = session.exec(select(User).where(User.email == "g@student.org")).first()
            if not user:
                user = User(
                    email="g@student.org",
                    password_hash=get_password_hash("demo123"),
                    full_name="Greg Demo",
                    major="Computer Science",
                    gpa=3.5,
                    on_track_score=88,
                    background="Transfer Student interested in AI",
                    interests="Robotics, Machine Learning, Guitar",
                    ai_insight="You are performing strongly in CS core classes but check your math requirements."
                )
                session.add(user)
                session.commit()
                session.refresh(user)
                log.append("Created user g@student.org")
            else:
                log.append("User g@student.org already exists")

            # 2. Clear existing data for this user to avoid duplicates if run multiple times
            # (Optional: for now we just append/check existence to be safe)
            
            # 3. Courses (Degree Roadmap)
            # Completed
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "CS101")).first():
                session.add(Course(user_id=user.id, name="Intro to Programming", code="CS101", grade="A", credits=4, suggestion="Completed"))
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "MATH101")).first():
                session.add(Course(user_id=user.id, name="Calculus I", code="MATH101", grade="B+", credits=4, suggestion="Completed"))
            
            # In Progress
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "CS201")).first():
                session.add(Course(user_id=user.id, name="Data Structures", code="CS201", grade="In Progress", credits=3, suggestion="Current"))
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "MATH201")).first():
                session.add(Course(user_id=user.id, name="Linear Algebra", code="MATH201", grade="In Progress", credits=3, suggestion="Current"))

            # Planned (AI Auto-Plan demo)
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "CS301")).first():
                session.add(Course(user_id=user.id, name="Algorithms", code="CS301", grade="Planned", credits=3, suggestion="Fall 2026"))
            if not session.exec(select(Course).where(Course.user_id == user.id, Course.code == "CS402")).first():
                session.add(Course(user_id=user.id, name="Machine Learning", code="CS402", grade="Planned", credits=3, suggestion="Spring 2027"))

            log.append("Seeded courses")

            # 4. Holds & Alerts (Dashboard/Signals)
            if not session.exec(select(StudentHold).where(StudentHold.user_id == user.id, StudentHold.title == "Tuition Balance")).first():
                session.add(StudentHold(
                    user_id=user.id, 
                    item_type="hold", 
                    category="Financial", 
                    title="Tuition Balance", 
                    description="Outstanding balance for Spring semester.", 
                    amount=4500.00, 
                    status="active",
                    due_date=datetime.utcnow() + timedelta(days=15)
                ))
            
            if not session.exec(select(StudentHold).where(StudentHold.user_id == user.id, StudentHold.title == "Midterm Alert")).first():
                session.add(StudentHold(
                    user_id=user.id, 
                    item_type="alert", 
                    category="Academic", 
                    title="Midterm Alert", 
                    description="Prof. Smith flagged low attendance in Linear Algebra.", 
                    amount=0, 
                    status="active"
                ))

            log.append("Seeded holds/alerts")

            # 5. Marketplace & Social (Social Campus)
            # Create a dummy seller if needed, or just let Greg sell something
            if not session.exec(select(MarketplaceItem).where(MarketplaceItem.seller_id == user.id)).first():
                session.add(MarketplaceItem(
                    seller_id=user.id,
                    seller_name=user.full_name,
                    title="Used Calculus Textbook",
                    price=45.00,
                    condition="Good",
                    status="available"
                ))
            
            # 6. Scholarships (Financial Nexus)
            if not session.exec(select(Scholarship).where(Scholarship.provider == "Tech Foundation")).first():
                session.add(Scholarship(
                    title="Future Tech Leader Grant",
                    description="For students demonstrating excellence in CS.",
                    amount=2500.00,
                    deadline=datetime.utcnow() + timedelta(days=60),
                    requirements="GPA > 3.5, CS Major",
                    category="Merit",
                    provider="Tech Foundation"
                ))
            
            session.commit()
            log.append("Seeded Marketplace and Scholarships")

        return {"status": "success", "log": log, "user": "g@student.org", "password": "demo123"}

    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}

# --- Texas Higher Education Accountability Module ---
try:
    # Try importing from local 'texas_analytics' (relative to this file)
    try:
        from texas_analytics import TexasAccountabilityScraper
    except ImportError:
        # Fallback for module execution
        try:
            from api.texas_analytics import TexasAccountabilityScraper
from api.cip_codes import CIPCode, refresh_cip_database
        except ImportError:
            # Last resort: try standard import if in sys.path
            import texas_analytics as TexasAccountabilityScraper

    texas_scraper = TexasAccountabilityScraper()
    print("✓ Texas Analytics Module Loaded")
except Exception as e:
    texas_scraper = None
    print(f"Warning: Texas Module could not load: {e}")

@app.get("/api/texas/colleges")
def get_texas_colleges():
    """Returns list of Texas Colleges from the scraper."""
    if not texas_scraper:
        return {"error": "Texas Module not active"}
    return texas_scraper.fetch_all_institutions()

from pydantic import BaseModel

class TexasAnalyzeRequest(BaseModel):
    instId: str
    sector: str
    typeId: int
    name: str

class TexasReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    inst_id: str
    name: str
    sector: str
    data_json: str # Storing JSON as string for simplicity on SQLite/Postgres compatibility
    ai_insight: str
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Ensure table exists (Quick migration for Vercel)
try:
    SQLModel.metadata.create_all(engine)
except:
    pass

@app.post("/api/texas/analyze")
def analyze_texas_college(req: TexasAnalyzeRequest):
    """
    Fetches metrics and generates Gemini insights for a college.
    Strategy: Check DB first -> If missing, Scrape & Save.
    """
    if not texas_scraper:
        return {"error": "Texas Module not active"}
    
    # 1. Check Database
    try:
        from sqlmodel import Session, select
        with Session(engine) as session:
            existing = session.exec(select(TexasReport).where(TexasReport.inst_id == req.instId)).first()
            if existing:
                # Return cached data
                # TODO: Add logic to refresh if > 30 days
                return {
                    "college": existing.name,
                    "data_summary": json.loads(existing.data_json),
                    "ai_insight": existing.ai_insight,
                    "source": "database"
                }
    except Exception as db_e:
        print(f"DB Read Error: {db_e}")

    # 2. Scrape Live
    data = texas_scraper.fetch_college_metrics(req.instId, req.sector, req.typeId)
    
    # 3. Analyze
    insight = texas_scraper.generate_insights(req.name, data)
    
    # 4. Save to DB
    try:
        from sqlmodel import Session
        with Session(engine) as session:
            # Upsert logic (Delete old if exists)
            # For now, just create new or ignore
            new_report = TexasReport(
                inst_id=req.instId,
                name=req.name,
                sector=req.sector,
                data_json=json.dumps(data),
                ai_insight=insight
            )
            session.add(new_report)
            session.commit()
    except Exception as save_e:
        print(f"DB Save Error: {save_e}")
    
    return {
        "college": req.name,
        "data_summary": data, 
        "ai_insight": insight,
        "source": "live_scrape"
    }

@app.get("/api/texas/cron/refresh")
def cron_refresh_texas_data():
    """
    CRON JOB Endpoint (e.g., Monthly).
    Refreshes stale data for a few colleges to keep DB up to date.
    """
    if not texas_scraper:
        return {"status": "skipped", "reason": "module_not_loaded"}
    
    updated_count = 0
    errors = []
    
    try:
        from sqlmodel import Session, select
        from datetime import timedelta
        
        with Session(engine) as session:
            # Find reports > 30 days old
            cutoff = datetime.utcnow() - timedelta(days=30)
            stale_reports = session.exec(select(TexasReport).where(TexasReport.last_updated < cutoff).limit(5)).all()
            
            for report in stale_reports:
                try:
                    # Refresh logic (simplified)
                    type_id = 1 # Approximated/Default
                    if report.sector == 'health-related': type_id = 2 
                    
                    data = texas_scraper.fetch_college_metrics(report.inst_id, report.sector, type_id)
                    insight = texas_scraper.generate_insights(report.name, data)
                    
                    report.data_json = json.dumps(data)
                    report.ai_insight = insight
                    report.last_updated = datetime.utcnow()
                    session.add(report)
                    updated_count += 1
                except Exception as e:
                    errors.append(f"{report.name}: {str(e)}")
            
            session.commit()
            
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    return {
        "status": "success", 
        "updated": updated_count,
        "errors": errors
    }

# --- CIP CODES API ---

@app.get("/api/cip")
def get_cip_codes(search: Optional[str] = None):
    with Session(engine) as session:
        query = select(CIPCode)
        if search:
            query = query.where(
                (CIPCode.title.contains(search)) | 
                (CIPCode.code.contains(search))
            )
        results = session.exec(query.limit(100)).all()
        return results

@app.post("/api/cip/refresh")
def refresh_cip_codes_endpoint():
    with Session(engine) as session:
        try:
            result = refresh_cip_database(session)
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}



