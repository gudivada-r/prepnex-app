import os
import json
import datetime
import httpx
from sqlmodel import Session, select
from app.auth import engine
from app.models import User, StudentHold
from app.ednex import get_all_ednex_users, get_ednex_context_by_email, update_ednex_ai_summary

async def run_proactive_intelligence_batch():
    """
    Background worker that fetches EdNex data and generates proactive nudges.
    """
    print(f"[{datetime.datetime.now()}] Starting Intelligence Batch...")
    
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Batch Cancelled: No GOOGLE_API_KEY")
        return {"status": "error", "message": "No API Key"}

    # 1. Fetch all students from EdNex
    try:
        # We simulate a "System" caller for the admin restricted function
        # Or just use the supabase client directly for internal batch
        users = await get_all_ednex_users(current_user=User(is_admin=True)) 
    except Exception as e:
        print(f"Batch Error fetching users: {e}")
        return {"status": "error", "message": str(e)}

    nudges_count = 0
    
    for user_data in users:
        email = user_data["email"]
        name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}"
        
        # 2. Get full context for this user
        ctx = await get_ednex_context_by_email(email)
        if not ctx: continue
        
        # 3. Use AI to detect "Anomalies" or "Nudges"
        # We'll use a specific prompt for proactive intervention
        sis = ctx.get("sis_stream", {})
        fin = ctx.get("finance_stream", {})
        gpa = sis.get("total_gpa", 0.0)
        standing = sis.get("academic_standing", "Unknown")
        balance = fin.get("net_amount_due", 0.0)
        
        prompt = f"""
        Act as a Proactive Student Success Agent named Aura.
        Analyze this student's current status and generate a brief, encouraging 'Nudge' if they need attention.
        
        Student: {name}
        GPA: {gpa}
        Standing: {standing}
        Financial Balance: ${balance}
        Degree Audit Items: {len(ctx.get('advisement_stream', []))}
        
        Criteria for Nudges:
        1. GPA below 2.5: Suggest tutoring or a study plan.
        2. Financial Balance > $500: Mention payment plans or holds.
        3. Missing Degree Requirements: Remind about registration.
        4. High Performer (GPA > 3.8): Congratulate and suggest peer mentoring roles.
        
        Output valid JSON:
        {{
            "should_nudge": true/false,
            "nudge_type": "alert" or "celebration" or "task",
            "message": "The message to send the student",
            "reason": "Internal reasoning for the advisor"
        }}
        """
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
                nudge_data = json.loads(raw_json)
                
                if nudge_data.get("should_nudge"):
                    # 4. Persistence & Alerting
                    # A. Push insight back to EdNex
                    update_ednex_ai_summary(email, f"PROACTIVE NUDGE: {nudge_data['message']}")
                    
                    # B. If user exists in our local DB, create a StudentHold (Alert)
                    with Session(engine) as session:
                        local_user = session.exec(select(User).where(User.email == email)).first()
                        if local_user:
                            # Avoid duplicates: only add if no similar alert in last 24h
                            new_alert = StudentHold(
                                user_id=local_user.id,
                                item_type=nudge_data.get("nudge_type", "alert"),
                                category="AI Nudge",
                                title="Aura Intelligence Insight",
                                description=nudge_data["message"],
                                status="active"
                            )
                            session.add(new_alert)
                            session.commit()
                    
                    nudges_count += 1
                    print(f"Generated nudge for {email}: {nudge_data['message'][:50]}...")
                    
        except Exception as e:
            print(f"Error processing nudge for {email}: {e}")
            continue

    print(f"[{datetime.datetime.now()}] Batch Complete. Total Nudges: {nudges_count}")
    return {"status": "success", "nudges_processed": nudges_count}
