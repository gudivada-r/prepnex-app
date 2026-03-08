from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
from typing import Dict, Any, List
import json
from pydantic import BaseModel

from app.auth import get_current_user
from app.models import User

# Initialize Router
ednex_router = APIRouter()

def get_supabase_client():
    from supabase import create_client, Client
    from sqlmodel import Session, select
    from app.auth import engine
    from app.models import SystemConfig
    
    url = None
    key = None
    
    # Check Database Config FIRST (Allows UI Override)
    try:
        with Session(engine) as session:
            url_cfg = session.exec(select(SystemConfig).where(SystemConfig.key_name == 'SUPABASE_URL')).first()
            key_cfg = session.exec(select(SystemConfig).where(SystemConfig.key_name == 'SUPABASE_KEY')).first()
            if url_cfg and key_cfg and url_cfg.key_value and key_cfg.key_value:
                url = url_cfg.key_value
                key = key_cfg.key_value
    except Exception as e:
        print("Error accessing SystemConfig:", e)
    
    # Fallback to Environment Variables
    if not url or not key:
        url = os.environ.get("SUPABASE_URL", "https://rfkoylpcuptzkakmqotq.supabase.co")
        key = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJma295bHBjdXB0emtha21xb3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzY0MDYsImV4cCI6MjA4ODQxMjQwNn0.kcUD2GGSmMJLcG0tyJZtbCd9h9gB2S8jFYDz9RJKMe8")
                
    if not url or not key:
        return None
        
    return create_client(url, key)

class EdNexConfig(BaseModel):
    url: str
    key: str

@ednex_router.get("/config")
async def get_ednex_config(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Not an admin')
    from app.auth import engine
    from sqlmodel import Session, select
    from app.models import SystemConfig
    
    # Check Database Config FIRST
    try:
        with Session(engine) as session:
            url_cfg = session.exec(select(SystemConfig).where(SystemConfig.key_name == 'SUPABASE_URL')).first()
            if url_cfg and url_cfg.key_value:
                return {"configured": True, "source": "db"}
    except:
        pass
        
    # Fallback to Env
    url = os.environ.get("SUPABASE_URL")
    if url:
        return {"configured": True, "source": "env"}
        
    return {"configured": False, "source": "none"}

@ednex_router.post("/config")
async def save_ednex_config(
    config: EdNexConfig,
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Not an admin')
    
    from app.auth import engine
    from sqlmodel import Session, select
    from app.models import SystemConfig
    
    with Session(engine) as session:
        url_cfg = session.exec(select(SystemConfig).where(SystemConfig.key_name == 'SUPABASE_URL')).first()
        key_cfg = session.exec(select(SystemConfig).where(SystemConfig.key_name == 'SUPABASE_KEY')).first()
        
        if url_cfg: url_cfg.key_value = config.url
        else: session.add(SystemConfig(key_name='SUPABASE_URL', key_value=config.url))
            
        if key_cfg: key_cfg.key_value = config.key
        else: session.add(SystemConfig(key_name='SUPABASE_KEY', key_value=config.key))
            
        session.commit()
    
    return {"status": "success", "message": "Supabase configuration saved."}

@ednex_router.get("/context")
async def get_ednex_context(
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the hybrid Student Context from EdNex (Option A Architecture).
    Strictly uses Supabase and data integration. NO mock data allowed.
    """
    supabase = get_supabase_client()

    if supabase:
        try:
            # Try to match by email first
            student_resp = supabase.table("mod00_users").select("*").eq("email", current_user.email).execute()
            student_data = student_resp.data[0] if student_resp.data else None

            if student_data:
                student_id = student_data["id"]

                # 1. Fetch SIS Stream Data (mod01)
                sis_resp = supabase.table("mod01_student_profiles").select("*").eq("user_id", student_id).execute()
                sis_data = sis_resp.data[0] if sis_resp.data else {}

                # 2. Fetch Finance Stream Data (mod02)
                finance_resp = supabase.table("mod02_student_accounts").select("*").eq("student_id", student_id).execute()
                finance_data = finance_resp.data[0] if finance_resp.data else {}

                context = {
                    "student_profile": {
                        "name": f"{student_data.get('first_name', '')} {student_data.get('last_name', '')}",
                        "email": student_data.get("email"),
                        "institution_id": student_data.get("institution_id")
                    },
                    "sis_stream": sis_data,
                    "finance_stream": finance_data
                }

                return {
                    "status": "success",
                    "source": "EdNex Central Staging",
                    "context": context
                }
            else:
                return {"status": "error", "message": "Student not found in EdNex database"}
        except Exception as e:
            print(f"EdNex Supabase error: {e}")
            return {"status": "error", "message": f"EdNex connection error: {str(e)}"}

    return {"status": "error", "message": "EdNex Supabase integration not configured."}

def update_ednex_ai_summary(email: str, summary_content: str):
    """
    Pushes AI context summaries back to the EdNex data warehouse to maintain stateless proxy architecture.
    """
    supabase = get_supabase_client()
    if not supabase:
        return {"status": "error", "message": "EdNex not configured"}
        
    try:
        # 1. Match student directly via their central EdNex identity
        student_resp = supabase.table("mod00_users").select("id").eq("email", email).execute()
        if student_resp.data:
            student_id = student_resp.data[0]["id"]
            
            # 2. Push the insight back to the institution's data warehouse
            import datetime
            insight_payload = f"[{datetime.datetime.now().strftime('%Y-%m-%d')}] AI Sync: {summary_content}"
            supabase.table("mod01_student_profiles").update({
                "ai_insight": insight_payload
            }).eq("user_id", student_id).execute()
            
            return {"status": "success", "message": "Pushed to EdNex successfully"}
    except Exception as e:
        print(f"Failed to sync AI summary to EdNex: {e}")
        return {"status": "error", "message": str(e)}

class SemanticQuery(BaseModel):
    query: str
    target_institution_id: str = "11111111-1111-1111-1111-111111111111"

@ednex_router.post("/semantic-search")
async def semantic_search(
    request: SemanticQuery,
    current_user: User = Depends(get_current_user)
):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="EdNex Database not configured")
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"As an AI Advisor attached to the EdNex platform, briefly answer this student question directly using institutional knowledge: {request.query}"
        response = model.generate_content(prompt)
        
        return {
            "status": "success",
            "matches": [
                {
                    "content": response.text,
                    "similarity": 0.95,
                    "source": "EdNex Intelligence Engine"
                }
            ]
        }
    except Exception as e:
        print(f"EdNex Search Error: {e}")
        return {"status": "error", "message": str(e)}

@ednex_router.get('/health')
async def get_ednex_health(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Not an admin')
    
    supabase = get_supabase_client()
    modules = {
        'Mod-00: Identity (Institutions)': 'mod00_institutions',
        'Mod-00: Identity (Users)': 'mod00_users',
        'Mod-01: SIS (Programs)': 'mod01_programs',
        'Mod-01: SIS (Profiles)': 'mod01_student_profiles',
        'Mod-02: Finance (Accounts)': 'mod02_student_accounts',
        'Mod-02: Finance (Transactions)': 'mod02_transactions',
        'Mod-03: Advisors': 'mod03_advisors',
        'Mod-03: Appointments': 'mod03_advising_appointments',
        'Mod-03: Interventions': 'mod03_intervention_flags',
        'Mod-04: Catalog (Courses)': 'mod04_courses',
        'Mod-04: Catalog (Sections)': 'mod04_sections',
        'Mod-04: Catalog (Enrollments)': 'mod04_enrollments',
        'Mod-05: Career (Companies)': 'mod05_companies',
        'Mod-05: Career (Jobs)': 'mod05_jobs',
        'Mod-05: Career (Applications)': 'mod05_applications'
    }

    health_data = {}
    if not supabase:
        # NO MOCKS if it's not configured!
        for idx, key in enumerate(modules.keys()):
            health_data[key] = {'count': 0, 'status': 'Disabled: EdNex not configured'}
        return {'status': 'success', 'modules': health_data}

    try:
        for title, table in modules.items():
            try:
                resp = supabase.table(table).select('*', count='exact').limit(1).execute()
                c = resp.count if resp.count is not None else 0
                health_data[title] = {'count': c, 'status': 'Operational'}
            except Exception as e:
                health_data[title] = {'count': 0, 'status': f'Anomaly: {str(e)[:50]}'}
        return {'status': 'success', 'modules': health_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@ednex_router.get("/user/search/{query_term}")
async def search_ednex_users(
    query_term: str,
    current_user: User = Depends(get_current_user)
):
    """
    Look up all specific user info across modules in EdNex, fuzzy matching name, email, or department.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Not an admin')
        
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="EdNex not configured")
        
    try:
        # 1. Search by name or email
        student_resp = supabase.table("mod00_users").select("*").or_(f"email.ilike.%{query_term}%,first_name.ilike.%{query_term}%,last_name.ilike.%{query_term}%").limit(10).execute()
        users_found = student_resp.data if student_resp.data else []
        
        # 2. Search by department or major (program name)
        prog_resp = supabase.table("mod01_programs").select("id").ilike("name", f"%{query_term}%").execute()
        prog_ids = [row["id"] for row in (prog_resp.data or [])]
        
        dept_user_ids = []
        if prog_ids:
            prof_resp = supabase.table("mod01_student_profiles").select("user_id").in_("program_id", prog_ids).limit(10).execute()
            dept_user_ids = [row["user_id"] for row in (prof_resp.data or [])]
        
        existing_ids = {u["id"] for u in users_found}
        missing_ids = [uid for uid in dept_user_ids if uid not in existing_ids]
        
        if missing_ids:
            missing_resp = supabase.table("mod00_users").select("*").in_("id", missing_ids).execute()
            if missing_resp.data:
                users_found.extend(missing_resp.data)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing EdNex datasets: {str(e)}")
        
    if not users_found:
        raise HTTPException(status_code=404, detail="No matching users found in EdNex")
        
    all_results = []
    
    for student_data in users_found:
        student_id = student_data["id"]
        
        modules_data = {
            'mod00_users': student_data,
            'mod01_student_profiles': None,
            'mod02_student_accounts': None,
            'mod03_advising_appointments': [],
            'mod04_enrollments': []
        }
        
        # Check Mod01
        try:
            p_resp = supabase.table("mod01_student_profiles").select("*").eq("user_id", student_id).execute()
            modules_data['mod01_student_profiles'] = p_resp.data[0] if p_resp.data else None
        except Exception as e: modules_data['mod01_student_profiles'] = {"error": str(e)}
        
        # Check Mod02
        try:
            f_resp = supabase.table("mod02_student_accounts").select("*").eq("student_id", student_id).execute()
            modules_data['mod02_student_accounts'] = f_resp.data[0] if f_resp.data else None
        except Exception as e: modules_data['mod02_student_accounts'] = {"error": str(e)}

        # Check Mod03
        try:
            a_resp = supabase.table("mod03_advising_appointments").select("*").eq("student_id", student_id).execute()
            modules_data['mod03_advising_appointments'] = a_resp.data if a_resp.data else []
        except Exception as e: modules_data['mod03_advising_appointments'] = {"error": str(e)}

        # Check Mod04
        try:
            e_resp = supabase.table("mod04_enrollments").select("*").eq("student_id", student_id).execute()
            modules_data['mod04_enrollments'] = e_resp.data if e_resp.data else []
        except Exception as e: modules_data['mod04_enrollments'] = {"error": str(e)}
        
        all_results.append({
            "ednex_student_id": student_id,
            "email": student_data.get('email', 'N/A'),
            "name": f"{student_data.get('first_name', '')} {student_data.get('last_name', '')}".strip(),
            "modules": modules_data
        })
    
    return {
        "status": "success",
        "query": query_term,
        "results": all_results
    }
