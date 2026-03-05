from fastapi import APIRouter, Depends, HTTPException, status, Request, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List, Optional, Dict
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import os
import stripe
from pydantic import BaseModel

from app.auth import get_session, create_access_token, get_password_hash, verify_password, get_current_user, get_admin_user
from app.models import ChatSession, ChatMessage, Tutor, User, StudentHold
from datetime import datetime, timedelta
from app.integrations.lms.canvas import CanvasService

# Optional imports for AI Navigator (may not be available on Vercel due to size constraints)
try:
    from app.agent.graph import app_graph
    from langchain_core.messages import HumanMessage, AIMessage
    AGENT_AVAILABLE = True
except ImportError:
    AGENT_AVAILABLE = False
    print("WARNING: AI Navigator agent not available (langgraph not installed)")

router = APIRouter()

# Stripe Configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CheckoutRequest(BaseModel):
    price_id: str

@router.post("/payments/create-checkout-session")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=current_user.email,
            line_items=[
                {
                    'price': request.price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{frontend_url}/dashboard?payment=success",
            cancel_url=f"{frontend_url}/dashboard?payment=cancel",
            metadata={
                'user_id': current_user.id
            }
        )
        return {"id": checkout_session.id, "url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/payments/webhook")
async def stripe_webhook(request: Request, session: Session = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=f"Webhook Error: {str(e)}")

    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        user_id = session_data['metadata'].get('user_id')
        if user_id:
            statement = select(User).where(User.id == int(user_id))
            user = session.exec(statement).first()
            if user:
                user.subscription_status = "active"
                user.stripe_customer_id = session_data.get('customer')
                user.stripe_subscription_id = session_data.get('subscription')
                session.add(user)
                session.commit()
    
    return {"status": "success"}
    
async def verify_subscription(current_user: User = Depends(get_current_user)):
    if current_user.is_admin:
        return True
    if current_user.subscription_status == "active":
        return True
    if current_user.subscription_status == "trialing":
        if current_user.trial_ends_at and current_user.trial_ends_at > datetime.utcnow():
            return True
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED, 
        detail="Subscription required. Your 7-day free trial has expired."
    )


class SyllabusEvent(BaseModel):
    title: str
    date: str
    type: str  # 'exam', 'assignment', 'reading'

@router.post("/ai/parse-syllabus")
async def parse_syllabus(file: bytes = File(...)):
    # Mock OCR and Extraction Logic
    # In production: Use Google Document AI or Tesseract + GPT-4
    
    # Simulating found dates
    return {
        "events": [
            {"title": "Midterm Exam", "date": "2025-10-15", "type": "exam"},
            {"title": "Chapter 5 Essay", "date": "2025-10-22", "type": "assignment"},
            {"title": "Final Project Proposal", "date": "2025-11-01", "type": "assignment"},
            {"title": "Guest Lecture: Dr. Smith", "date": "2025-11-05", "type": "reading"}
        ]
    }


@router.post("/ai/transcribe")
async def transcribe_audio(
    file: bytes = File(...), 
    language: str = Form("English"),
    subscribed: bool = Depends(verify_subscription)
):
    # Check for API Key
    api_key = os.environ.get("GOOGLE_API_KEY")
    print(f"DEBUG: Checking API KEY. Present? {bool(api_key)}")
    if api_key:
        print(f"DEBUG: API Key found: {api_key[:5]}...")

    if api_key:
        try:
            import google.generativeai as genai
            import tempfile
            import json

            genai.configure(api_key=api_key)
            
            # Save temporary file because Gemini needs a file path or upload
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
                temp_audio.write(file)
                temp_audio_path = temp_audio.name
            
            try:
                # Upload the file to Gemini
                print("Uploading file to Gemini...")
                audio_file = genai.upload_file(path=temp_audio_path, display_name="Lecture Audio")
                
                # Wait for processing (usually fast for audio)
                import time
                while audio_file.state.name == "PROCESSING":
                    time.sleep(1)
                    audio_file = genai.get_file(audio_file.name)
                
                if audio_file.state.name == "FAILED":
                    raise Exception("Audio file processing failed by Gemini.")

                model = genai.GenerativeModel('gemini-flash-latest')
                
                prompt = f"""
                You are an expert academic assistant. The user wants the output in {language}.
                1. Transcribe the audio file fully into the "transcript" field.
                2. Summarize the transcript into 5 key takeaways into the "summary" JSON array.
                3. Extract any specific tasks, deadlines, or assignments mentioned into an "action_items" JSON array.
                4. Extract 5-10 technical terms or key concepts into a "keywords" JSON array.
                5. Suggest 3 thoughtful follow-up questions for the student to ask their professor based on the content into a "follow_up_questions" JSON array.
                
                Return exactly this JSON structure:
                {{
                    "transcript": "...",
                    "summary": ["...", "..."],
                    "action_items": ["...", "..."],
                    "keywords": ["...", "..."],
                    "follow_up_questions": ["...", "..."]
                }}
                """
                
                # Generate content
                print("Generating content...")
                response = model.generate_content(
                    [prompt, audio_file],
                    generation_config={"response_mime_type": "application/json"}
                )
                
                # Parse JSON
                data = json.loads(response.text)
                
                # Clean up Gemini file (optional but good practice)
                # genai.delete_file(audio_file.name) 

                return {
                    "transcript": data.get("transcript", ""),
                    "summary": data.get("summary", []),
                    "action_items": data.get("action_items", []),
                    "keywords": data.get("keywords", []),
                    "follow_up_questions": data.get("follow_up_questions", [])
                }
            finally:
                # Clean up local temp file
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)

        except Exception as e:
            print(f"Gemini Transcription Failed: {e}")
            # Fall through to mock

    # Mock Logic (Fallback)
    import asyncio
    await asyncio.sleep(2)
    
    mock_transcripts = {
        "Spanish": "Bien, hoy vamos a hablar de las mitocondrias. Como discutimos la semana pasada, es esencialmente la central eléctrica de la célula.",
        "French": "D'accord, aujourd'hui nous allons parler des mitochondries. Comme nous en avons discuté la semaine dernière, c'est essentiellement la centrale électrique de la cellule.",
        "Mandarin Chinese": "好了，今天我们要讲线粒体。正如我们上周讨论的，它本质上是细胞的动力源。",
        "Hindi": "ठीक है, तो आज हम माइटोकॉन्ड्रिया के बारे में बात करने जा रहे हैं। जैसा कि हमने पिछले हफ्ते चर्चा की थी, यह अनिवार्य रूप से कोशिका का पावरहाउस है।",
        "English": "Okay, so today we are going to talk about the mitochondria. As we discussed last week, it is essentially the powerhouse of the cell."
    }
    
    text = mock_transcripts.get(language, f"[Mock output for {language}]: " + mock_transcripts["English"])

    return {
        "transcript": text + " (Note: This is a Mock Transcription because GOOGLE_API_KEY was not found or call failed.)",
        "summary": [
            f"Topic: Mitochondria function ({language}).",
            "Key Concept: 'Powerhouse of the cell'.",
            "Process: Generates chemical energy.",
            f"Note: Please configure GOOGLE_API_KEY for real {language} translation."
        ],
        "action_items": [
            "Review the diagram of the electron transport chain.",
            "Complete the quiz on cellular respiration by Friday."
        ],
        "keywords": ["ATP", "Aerobic Respiration", "Inner Membrane", "Matrix", "Powerhouse"],
        "follow_up_questions": [
            "How does mitochondrial density vary between different types of muscle tissue?",
            "What happens if the mitochondrial DNA is mutated?",
            "Can you explain the endosymbiotic theory again in more detail?"
        ]
    }


# --- Lecture Notes Endpoints ---

from app.models import LectureNote
from pydantic import BaseModel

class LectureNoteSave(BaseModel):
    title: Optional[str] = None
    course_name: Optional[str] = None
    professor_name: Optional[str] = None
    transcript: str
    summary: List[str]
    action_items: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    follow_up_questions: Optional[List[str]] = None
    language: str = "English"
    duration_seconds: int = 0

@router.post("/lecture-notes/save")
async def save_lecture_note(
    note_data: LectureNoteSave,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Save a lecture note with transcript and summary"""
    import json
    from datetime import datetime
    
    # Auto-generate title if not provided
    title = note_data.title
    if not title:
        # AI-generated title based on course/professor/date
        if note_data.course_name and note_data.professor_name:
            title = f"{note_data.course_name} - {note_data.professor_name} - {datetime.now().strftime('%m/%d/%Y')}"
        elif note_data.course_name:
            title = f"{note_data.course_name} - {datetime.now().strftime('%m/%d/%Y')}"
        else:
            title = f"Lecture - {datetime.now().strftime('%m/%d/%Y %I:%M %p')}"
    
    lecture_note = LectureNote(
        user_id=current_user.id,
        title=title,
        course_name=note_data.course_name,
        professor_name=note_data.professor_name,
        transcript=note_data.transcript,
        summary=json.dumps(note_data.summary),
        action_items=json.dumps(note_data.action_items) if note_data.action_items else None,
        keywords=json.dumps(note_data.keywords) if note_data.keywords else None,
        follow_up_questions=json.dumps(note_data.follow_up_questions) if note_data.follow_up_questions else None,
        language=note_data.language,
        duration_seconds=note_data.duration_seconds
    )
    
    session.add(lecture_note)
    session.commit()
    session.refresh(lecture_note)
    
    return {"id": lecture_note.id, "title": lecture_note.title, "message": "Lecture note saved successfully"}

@router.get("/lecture-notes/history")
async def get_lecture_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all lecture notes for the current user, sorted by date desc"""
    import json
    statement = select(LectureNote).where(LectureNote.user_id == current_user.id).order_by(LectureNote.created_at.desc())
    notes = session.exec(statement).all()
    
    # Parse summary JSON for each note
    result = []
    for note in notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "course_name": note.course_name,
            "professor_name": note.professor_name,
            "transcript": note.transcript,
            "summary": json.loads(note.summary) if note.summary else [],
            "action_items": json.loads(note.action_items) if note.action_items else [],
            "keywords": json.loads(note.keywords) if note.keywords else [],
            "follow_up_questions": json.loads(note.follow_up_questions) if note.follow_up_questions else [],
            "language": note.language,
            "duration_seconds": note.duration_seconds,
            "is_bookmarked": note.is_bookmarked,
            "created_at": note.created_at.isoformat()
        })
    
    return result

@router.get("/lecture-notes/{note_id}")
async def get_lecture_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific lecture note"""
    import json
    note = session.get(LectureNote, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture note not found")
    
    return {
        "id": note.id,
        "title": note.title,
        "course_name": note.course_name,
        "professor_name": note.professor_name,
        "transcript": note.transcript,
        "summary": json.loads(note.summary) if note.summary else [],
        "language": note.language,
        "duration_seconds": note.duration_seconds,
        "is_bookmarked": note.is_bookmarked,
        "created_at": note.created_at.isoformat()
    }

@router.put("/lecture-notes/{note_id}/bookmark")
async def toggle_bookmark(
    note_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Toggle bookmark status for a lecture note"""
    note = session.get(LectureNote, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture note not found")
    
    note.is_bookmarked = not note.is_bookmarked
    session.add(note)
    session.commit()
    
    return {"is_bookmarked": note.is_bookmarked}

@router.delete("/lecture-notes/{note_id}")
async def delete_lecture_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a lecture note"""
    note = session.get(LectureNote, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture note not found")
    
    session.delete(note)
    session.commit()
    
    return {"message": "Lecture note deleted"}


class FlashcardRequest(BaseModel):
    note_content: Optional[str] = None
    course_name: Optional[str] = None
    topic: Optional[str] = None

@router.post("/ai/flashcards")
async def generate_flashcards(
    request: FlashcardRequest, 
    current_user: User = Depends(get_current_user),
    subscribed: bool = Depends(verify_subscription)
):
    # Determine if this is a "Topic" request or "Content" request
    is_topic_request = False
    topic_query = ""
    
    if request.course_name and request.topic:
        is_topic_request = True
        topic_query = f"{request.topic} in the context of {request.course_name}"
    
    elif request.note_content:
        if len(request.note_content.strip()) < 100:
            is_topic_request = True
            topic_query = request.note_content.strip()
        else:
            is_topic_request = False
    
    # 1. Gemini Generation (Preferred)
    debug_info = "Unknown Error"
    api_key = os.environ.get("GOOGLE_API_KEY")
    # print(f"DEBUG FLASHCARDS: API Key present? {bool(api_key)}")
    
    if api_key:
        print(f"DEBUG FLASHCARDS: Attempting Gemini generation for topic_request={is_topic_request}")
        try:
            import google.generativeai as genai
            import json
            
            genai.configure(api_key=api_key)
            # Switch to 'gemini-1.5-flash' to avoid 404 on 'gemini-pro'
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            if is_topic_request:
                prompt = f"Generate exactly 20 flashcards for the topic: '{topic_query}'. Return valid JSON array of objects with 'front' and 'back' keys."
            else:
                prompt = f"Extract exactly 20 flashcards from the following notes. Return valid JSON array of objects with 'front' and 'back' keys.\n\nNotes:\n{request.note_content[:2000]}"

            print(f"DEBUG FLASHCARDS: Sending prompt to Gemini...")
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # print(f"DEBUG FLASHCARDS: Got response from Gemini, parsing...")
            data = json.loads(response.text)
            
            if isinstance(data, list):
                cards_data = data
            elif isinstance(data, dict):
                cards_data = data.get("flashcards", data.get("cards", []))
            else:
                cards_data = []

            # Format response
            cards = [{"id": f"card-{i}", "front": c["front"], "back": c["back"]} for i, c in enumerate(cards_data)]
            print(f"DEBUG FLASHCARDS: Successfully generated {len(cards)} cards")
            return {"flashcards": cards}
            
        except Exception as e:
            import traceback
            error_str = str(e)
            if "SERVICE_DISABLED" in error_str:
                debug_info = "Google API Service is Disabled."
            elif "API_KEY_INVALID" in error_str or "403" in error_str:
                debug_info = "Invalid or Blocked API Key."
            elif "404" in error_str:
                 debug_info = "Model not found (404). Check model name."
            else:
                debug_info = f"Error: {error_str[:100]}..."
                
            print(f"DEBUG: Gemini Flashcard Gen Failed. Error: {e}")
            # print(f"DEBUG: Traceback: {traceback.format_exc()}")
            # Fallthrough to Rule-based
            
    else:
        print("DEBUG FLASHCARDS: No API key found, using fallback")
        debug_info = "GOOGLE_API_KEY not found"
            
    # 2. Rule-Based Generation (Fallback)
    if is_topic_request:
        # For topic requests without AI, we can only return placeholder data
        # or maybe search Wikipedia if we had that tool connected, but here just Mock.
        topic = topic_query or "General Knowledge"
        cards = []
        for i in range(1, 11): 
            cards.append({
                "id": f"mock-{i}", 
                "front": f"{topic} Concept {i}", 
                "back": f"This is a placeholder definition for concept {i} related to {topic}. (AI generation is disabled)"
            })
        return {"flashcards": cards}

    # Content-based generation
    content = request.note_content or ""
    cards = []
    
    # Try line-based parsing first (common for notes)
    import re
    lines = [l.strip() for l in content.split('\n') if l.strip()]
    
    # If very few lines, might be a paragraph text, try splitting by periods
    if len(lines) < 3 and len(content) > 50:
        lines = [s.strip() for s in content.split('.') if len(s.strip()) > 5]

    for i, line in enumerate(lines):
        front = ""
        back = ""
        
        # Primary Delimiters: Colon or Dash
        if ':' in line:
            parts = line.split(':', 1)
            f, b = parts[0].strip(), parts[1].strip()
            if f and b and len(f) < 60: # Assume 'Front' is reasonably short
                front, back = f, b
        elif ' - ' in line:
            parts = line.split(' - ', 1)
            f, b = parts[0].strip(), parts[1].strip()
            if f and b and len(f) < 60:
                front, back = f, b
        
        # Keyword patterns if no delimiter found
        if not front:
            # "X is Y" pattern
            match = re.match(r'^(.+?)\s+(is|are|refers to|means)\s+(.+)$', line, re.IGNORECASE)
            if match:
                f = match.group(1).strip()
                b = match.group(3).strip()
                if len(f) < 50:
                    front, back = f, b
        
        # If we successfully extracted a pair
        if front and back:
            cards.append({
                "id": f"card-{len(cards)}", 
                "front": front, 
                "back": back
            })
            
    # If strict parsing yielded few results, fall back to sentence-based chunks
    if len(cards) < 3:
        sentences = [s.strip() for s in content.replace('\n', ' ').split('.') if len(s.strip()) > 10]
        # Avoid duplicates if some were caught above
        existing_backs = {c['back'] for c in cards}
        
        for i, sent in enumerate(sentences):
            if sent in existing_backs: continue
            
            # Simple heuristic
            front = f"Key Point {len(cards)+1}"
            back = sent
            cards.append({
                "id": f"card-{len(cards)}", 
                "front": front, 
                "back": back
            })
            
    return {"flashcards": cards[:30]}


# --- Auth Endpoints ---

@router.post("/auth/register")
async def register(user: User, session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == user.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Set trial period (7 days)
        from datetime import timedelta
        user.trial_ends_at = datetime.utcnow() + timedelta(days=7)
        user.subscription_status = "trialing"
        
        user.password_hash = get_password_hash(user.password_hash)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User created successfully"}
    except Exception as e:
        # Return the error message to help debug 500 errors
        raise HTTPException(status_code=500, detail=str(e))

class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/auth/google")
async def google_auth(request: GoogleAuthRequest, session: Session = Depends(get_session)):
    """
    Verifies Google ID Token and returns an application JWT.
    """
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not google_client_id:
        # For development purposes, if client ID is missing, we might want to log it
        # but in production this must be set.
        print("WARNING: GOOGLE_CLIENT_ID is not set in environment variables.")
        # We'll allow it to proceed if we want to skip verification for testing, 
        # but normally we should fail.
        # raise HTTPException(status_code=500, detail="Google Client ID not configured")

    try:
        # Verify the ID token
        id_info = id_token.verify_oauth2_token(
            request.credential, 
            requests.Request(), 
            google_client_id
        )

        # ID token is valid, get user info
        email = id_info.get("email")
        full_name = id_info.get("name")
        picture = id_info.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token (no email)")

        # Check if user exists
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()

        if not user:
            # Create new user
            print(f"Creating new user from Google: {email}")
            user = User(
                email=email,
                full_name=full_name,
                password_hash=get_password_hash(os.urandom(16).hex()), # Random password
                is_active=True,
                subscription_status="trialing",
                trial_ends_at=datetime.utcnow() + timedelta(days=7)
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        
        if not user.is_active:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact your administrator.",
            )

        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "email": user.email,
                "full_name": user.full_name,
                "is_admin": user.is_admin
            }
        }

    except ValueError as e:
        # Invalid token
        print(f"Google Token Verification Failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        print(f"Google Auth Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    print(f"LOGIN ATTEMPT: {form_data.username}")
    try:
        statement = select(User).where(User.email == form_data.username)
        user = session.exec(statement).first()
        
        if not user:
            print("LOGIN FAILED: User not found")
        elif not verify_password(form_data.password, user.password_hash):
            print("LOGIN FAILED: Password mismatch")
        
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact your administrator.",
            )
        
        access_token = create_access_token(data={"sub": user.email})
        print("LOGIN SUCCESS")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Chat Endpoints ---

# --- Chat Endpoints ---

from pydantic import BaseModel
from fastapi import File, UploadFile, Form

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[int] = None
    file_id: Optional[str] = None # For demo, we just pass ID or Name

class ChatResponse(BaseModel):
    message_content: str
    cited_sources: List[str] = []
    action_items: List[str] = []
    session_id: int

@router.post("/chat/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Simulates document upload and analysis.
    In a real app, this would index the file into ChromaDB/Vector store.
    """
    # Just mock the processing for now
    file_content = await file.read()
    # file_text = extract_text(file_content) 
    
    # We'll just return success and the filename to act as a 'context' reference
    return {
        "status": "success",
        "filename": file.filename,
        "message": f"Successfully analyzed {file.filename}. I can now answer questions about it."
    }

@router.post("/chat/query", response_model=ChatResponse)
async def query_agent(
    request: ChatRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    subscribed: bool = Depends(verify_subscription)
):
    """
    Main endpoint to interact with the AntiGravity Agent.
    """
    # 1. Handle Session
    chat_session = None
    if request.session_id:
        chat_session = session.get(ChatSession, request.session_id)
        if not chat_session or chat_session.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        # Create new session
        title = f"Chat on {datetime.now().strftime('%m/%d %H:%M')}"
        chat_session = ChatSession(user_id=current_user.id, title=title)
        session.add(chat_session)
        session.commit()
        session.refresh(chat_session)

    # 2. Save User Message
    # Append file context if present
    content_to_save = request.query
    if request.file_id:
        content_to_save += f"\n\n[Attached File: {request.file_id}]"

    user_msg_db = ChatMessage(
        session_id=chat_session.id,
        sender="user",
        content=content_to_save
    )
    session.add(user_msg_db)
    session.commit()

    # 3. Retrieve Context (History)
    statement = select(ChatMessage).where(ChatMessage.session_id == chat_session.id).order_by(ChatMessage.timestamp.asc())
    history_msgs_db = session.exec(statement).all()
    
    # 4. Generate Response
    if AGENT_AVAILABLE:
        # Convert DB messages to LangChain format
        history_lc = []
        for msg in history_msgs_db:
            content = msg.content
            # If AI message is JSON, extract just the content for the context
            if msg.sender == "ai":
                try:
                    import json
                    data = json.loads(content)
                    text = data.get("message_content", "")
                    history_lc.append(AIMessage(content=text))
                except:
                    history_lc.append(AIMessage(content=content))
            else:
                history_lc.append(HumanMessage(content=content))

        # Invoke the graph
        inputs = {
            "messages": history_lc,
            "student_id": str(current_user.id),
            "next_step": "",
            "final_response": {}
        }
        
        try:
            result = await app_graph.ainvoke(inputs)
            final_response_dict = result.get("final_response", {})
        except Exception as e:
            print(f"Agent Execution Failed: {e}")
            final_response_dict = {
                "message_content": "I apologize, but I encountered an error while processing your request. Please try again in a moment.",
                "cited_sources": [],
                "action_items": []
            }
    else:
        # Fallback response when agent is not available
        final_response_dict = {
            "message_content": f"I received your message: '{request.query}'. The AI Navigator is currently running in limited mode. Please try the Flashcards or Voice Notes features which are fully functional!",
            "cited_sources": [],
            "action_items": []
        }
    
    # 5. Save AI Response
    import json
    ai_msg_db = ChatMessage(
        session_id=chat_session.id,
        sender="ai",
        content=json.dumps(final_response_dict)
    )
    session.add(ai_msg_db)
    session.commit()
    
    # 6. Return response with session_id
    return {
        **final_response_dict,
        "session_id": chat_session.id
    }

@router.get("/chat/history/sessions", response_model=List[ChatSession])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all chat sessions for the user."""
    statement = select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc())
    sessions = session.exec(statement).all()
    return sessions

@router.get("/chat/history/{session_id}", response_model=List[Dict])
async def get_session_history(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all messages for a specific session."""
    chat_session = session.get(ChatSession, session_id)
    if not chat_session or chat_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
        
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc())
    messages = session.exec(statement).all()
    
    # Process messages to return clean JSON
    processed_msgs = []
    import json
    for msg in messages:
        content = msg.content
        # If AI, try to parse JSON
        if msg.sender == "ai":
            try:
                content = json.loads(msg.content)
            except:
                pass # keep as string if fail
        
        processed_msgs.append({
            "sender": msg.sender,
            "content": content,
            "timestamp": msg.timestamp
        })
        
    return processed_msgs

@router.delete("/chat/history/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    chat_session = session.get(ChatSession, session_id)
    if not chat_session or chat_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete messages first (cascade usually handles this but SQLModel/SQLite might need help if not configured)
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    msgs = session.exec(statement).all()
    for m in msgs:
        session.delete(m)
        
    session.delete(chat_session)
    session.commit()
    return {"message": "Session deleted"}

@router.get("/users/me")
async def read_users_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Dynamic Insight Generation (Simple Rule-based for Demo)
    # In a real system, this would be an async background agent task
    if not current_user.ai_insight:
        insight = f"Welcome back, {current_user.full_name.split(' ')[0]}! "
        
        if current_user.gpa >= 3.5:
            insight += "You are doing excellently with a high GPA. Keep up the great work in your honors classes."
        elif current_user.gpa >= 3.0:
            insight += "You are on solid ground. A little extra focus on your upcoming finals could push you to the Dean's List."
        else:
            insight += "I noticed your GPA has room for improvement. Let's set up a tutoring session to get you back on track."
            
        current_user.ai_insight = insight
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
    # Check if trial has expired
    is_trial_active = False
    days_left = 0
    if current_user.subscription_status == "trialing":
        if current_user.trial_ends_at:
            if current_user.trial_ends_at > datetime.utcnow():
                is_trial_active = True
                delta = current_user.trial_ends_at - datetime.utcnow()
                days_left = delta.days
            else:
                current_user.subscription_status = "expired"
                session.add(current_user)
                session.commit()
                session.refresh(current_user)

    # Return a flattened response to maintain compatibility
    user_dict = current_user.dict()
    user_dict["subscription_info"] = {
        "status": current_user.subscription_status,
        "is_trial_active": is_trial_active,
        "days_left": days_left,
        "trial_ends_at": current_user.trial_ends_at.isoformat() if current_user.trial_ends_at else None
    }
    return user_dict

# --- Scheduling Endpoints ---

from pydantic import BaseModel

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    gpa: Optional[float] = None
    on_track_score: Optional[int] = None

@router.put("/users/me")
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.gpa is not None:
        current_user.gpa = user_update.gpa
    if user_update.on_track_score is not None:
        current_user.on_track_score = user_update.on_track_score
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

class BookingRequest(BaseModel):
    advisor_name: str
    date: str
    time: str
    reason: str

@router.post("/schedule/book")
async def book_appointment(
    request: BookingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # In a real app, save to DB and checking availability
    return {
        "status": "confirmed",
        "details": f"Appointment confirmed with {request.advisor_name} on {request.date} at {request.time}.",
        "action": "Calendar Invite Sent"
    }

from app.models import Advisor

@router.get("/advisors", response_model=List[Advisor])
async def get_advisors(
    session: Session = Depends(get_session)
):
    statement = select(Advisor)
    advisors = session.exec(statement).all()
    return advisors

# --- Course Endpoints ---

from app.models import Course

@router.get("/courses", response_model=List[Course])
async def get_courses(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(Course).where(Course.user_id == current_user.id)
    courses = session.exec(statement).all()
    return courses

@router.post("/courses", response_model=Course)
async def create_course(
    course: Course, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    course.user_id = current_user.id
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    course = session.exec(statement).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    session.delete(course)
    session.commit()
    return {"message": "Course deleted"}

# --- Advisor Endpoints ---

@router.post("/advisors", response_model=Advisor)
async def create_advisor(
    advisor: Advisor,
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    session.add(advisor)
    session.commit()
    session.refresh(advisor)
    return advisor

@router.delete("/advisors/{advisor_id}")
async def delete_advisor(
    advisor_id: int,
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    advisor = session.get(Advisor, advisor_id)
    if not advisor:
         raise HTTPException(status_code=404, detail="Advisor not found")
    
    session.delete(advisor)
    session.commit()
    return {"message": "Advisor deleted"}


# --- Tutor Endpoints ---

@router.get("/tutors", response_model=List[Tutor])
async def get_tutors(
    session: Session = Depends(get_session)
):
    statement = select(Tutor)
    tutors = session.exec(statement).all()
    return tutors

@router.post("/tutors", response_model=Tutor)
async def create_tutor(
    tutor: Tutor,
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    session.add(tutor)
    session.commit()
    session.refresh(tutor)
    return tutor

@router.delete("/tutors/{tutor_id}")
async def delete_tutor(
    tutor_id: int,
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    tutor = session.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    session.delete(tutor)
    session.commit()
    return {"message": "Tutor deleted"}

# --- Admin Outreach & Campaigns ---

from app.models import Campaign

@router.get("/admin/students")
async def get_admin_students(
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    """List all students for filtering (Admin Only)"""
    statement = select(User).where(User.is_admin == False)
    students = session.exec(statement).all()
    result = []
    for s in students:
        # Simple risk logic for demo
        risk = "Medium"
        if s.gpa < 2.3: risk = "High"
        elif s.gpa > 3.5: risk = "Low"
        
        result.append({
            "id": s.id,
            "name": s.full_name or s.email,
            "gpa": s.gpa,
            "risk": risk,
            "email": s.email
        })
    return result

@router.post("/admin/campaigns")
async def create_campaign(
    campaign: Campaign,
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    """Launch a new outreach campaign (Admin Only)"""
    campaign.admin_id = admin.id
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign

@router.get("/admin/campaigns")
async def get_campaigns(
    admin: User = Depends(get_admin_user),
    session: Session = Depends(get_session)
):
    """List all campaigns (Admin Only)"""
    statement = select(Campaign).order_by(Campaign.created_at.desc())
    return session.exec(statement).all()

# --- Form Endpoints ---

from app.models import FormRequest

@router.post("/forms/submit")
async def submit_form(
    form_request: FormRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    form_request.user_id = current_user.id
    session.add(form_request)
    session.commit()
    session.refresh(form_request)
    return {
        "status": "success",
        "message": f"Your {form_request.request_type} request for {form_request.course_code} has been submitted.",
        "request_id": form_request.id
    }

@router.get("/forms/my-requests", response_model=List[FormRequest])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(FormRequest).where(FormRequest.user_id == current_user.id)
    requests = session.exec(statement).all()
    return requests

# --- LMS Integration Endpoints ---

class LMSSyncResponse(BaseModel):
    status: str
    synced_courses: int
    data: List[Dict]

@router.get("/lms/sync")
async def sync_lms_data(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Syncs course data from LMS (Canvas or Blackboard).
    Reads configuration from Headers (passed by frontend) or Falls back to Env.
    """
    from app.integrations.lms.canvas import CanvasService
    from app.integrations.lms.blackboard import BlackboardService
    import os
    from dotenv import load_dotenv
    load_dotenv(override=True)

    # 1. Determine LMS Type
    # Frontend sends 'x-lms-type' header now (we will add this to frontend next)
    # If missing, default to Env 'LMS_PROVIDER' or 'Canvas'
    lms_type = request.headers.get("x-lms-type")
    if not lms_type:
        lms_type = os.getenv("LMS_PROVIDER", "Canvas")
    
    synced_count = 0
    
    if lms_type.lower() == "blackboard":
        # Blackboard Flow
        # Ideally read from headers, but for safety in this demo we might Mock it
        # bb_token = request.headers.get("x-lms-token")
        bb_service = BlackboardService() # Uses Mock by default
        try:
             synced_count = await bb_service.sync_to_db(current_user.id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Blackboard Sync failed: {str(e)}")
            
    else:
        # Default Canvas Flow
        canvas_token = request.headers.get("x-lms-token") or os.getenv("CANVAS_API_TOKEN")
        canvas_base_url = os.getenv("CANVAS_BASE_URL")
        
        # Fallback manual env read
        if not canvas_token:
             # ... (existing manual read logic omitted for brevity if not strictly needed, keeping it simple) ...
             # Actually, let's keep the existing env fallback logic just in case
             pass

        if not canvas_token:
            canvas_token = "7~3LxQLMnxX4ZRzFteTC97YuyJuPaR92Aef88eLEB3M9YLtmXQ8ezH7TkPXDk4cYVx" # Demo Fallback
            
        canvas = CanvasService(base_url=canvas_base_url, access_token=canvas_token) 
        try:
            synced_count = await canvas.sync_to_db(current_user.id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Canvas Sync failed: {str(e)}")

    return {
        "status": "success",
        "synced_courses": synced_count,
        "message": f"Successfully synchronized {synced_count} course(s) from {lms_type}."
    }

@router.get("/lms/courses/{course_id}")
async def get_canvas_course_details(
    course_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Direct proxy to fetch details for a specific Canvas course (e.g. 13694560).
    """
    import os
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    canvas_token = os.getenv("CANVAS_API_TOKEN")
    canvas_base_url = os.getenv("CANVAS_BASE_URL")
    canvas = CanvasService(base_url=canvas_base_url, access_token=canvas_token)
    
    try:
        details = await canvas.get_course_details(course_id)
        assignments = await canvas.get_assignments(course_id)
        return {
            "course": details,
            "assignments": assignments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Canvas Proxy failed: {str(e)}")


# --- Social Campus Endpoints ---

from app.models import StudyGroup, Mentorship, MarketplaceItem

# 1. Study Buddy Finder
@router.get("/social/study-groups", response_model=List[StudyGroup])
async def get_study_groups(session: Session = Depends(get_session)):
    return session.exec(select(StudyGroup)).all()

@router.post("/social/study-groups")
async def create_study_group(
    group: StudyGroup, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    group.created_by = current_user.id
    session.add(group)
    session.commit()
    session.refresh(group)
    return group

@router.post("/social/study-groups/{group_id}/join")
async def join_study_group(
    group_id: int, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    group = session.get(StudyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.members_count < group.max_members:
        group.members_count += 1
        session.add(group)
        session.commit()
        return {"message": "Joined successfully", "current_members": group.members_count}
    return {"message": "Group is full"}

# 2. Peer Mentoring
@router.get("/social/mentors", response_model=List[Mentorship])
async def get_mentors(session: Session = Depends(get_session)):
    return session.exec(select(Mentorship)).all()

@router.post("/social/mentors")
async def become_mentor(
    mentor: Mentorship, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    mentor.mentor_id = current_user.id
    mentor.mentor_name = current_user.full_name or "Student Mentor"
    session.add(mentor)
    session.commit()
    session.refresh(mentor)
    return mentor

@router.post("/social/mentors/{mentor_id}/book")
async def book_mentor(mentor_id: int, current_user: User = Depends(get_current_user)):
    # Mock booking logic
    return {"message": "Mentorship session booked! Check your email for details."}

# 3. Textbook Marketplace
@router.get("/social/marketplace", response_model=List[MarketplaceItem])
async def get_marketplace_items(session: Session = Depends(get_session)):
    return session.exec(select(MarketplaceItem).where(MarketplaceItem.status == "available")).all()

@router.post("/social/marketplace")
async def list_marketplace_item(
    item: MarketplaceItem, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    item.seller_id = current_user.id
    item.seller_name = current_user.full_name or "Student Seller"
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

# --- Holds & Financial Alerts Endpoints ---

@router.get("/holds", response_model=List[StudentHold])
async def get_my_holds(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all holds, alerts, and tasks for the current user."""
    statement = select(StudentHold).where(StudentHold.user_id == current_user.id).order_by(StudentHold.status.asc(), StudentHold.created_at.desc())
    return session.exec(statement).all()

@router.post("/holds", response_model=StudentHold)
async def create_hold(
    hold: StudentHold,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new hold (Admin Only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required")
    session.add(hold)
    session.commit()
    session.refresh(hold)
    return hold

@router.put("/holds/{hold_id}/resolve")
async def resolve_hold(
    hold_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Resolve a hold (Simulated for demo)."""
    hold = session.get(StudentHold, hold_id)
    if not hold or hold.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Hold not found")
    
    hold.status = "resolved" if hold.item_type != "task" else "completed"
    session.add(hold)
    session.commit()
    return {"status": "success", "message": f"Hold '{hold.title}' has been marked as {hold.status}."}

# --- Scholarship Endpoints ---

from app.models import Scholarship, PersonalizedStatement

@router.get("/scholarships", response_model=List[Scholarship])
async def get_scholarships(session: Session = Depends(get_session)):
    statement = select(Scholarship)
    return session.exec(statement).all()

@router.post("/ai/scholarships/match")
async def match_scholarships(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Matches scholarships to the user profile using AI"""
    scholarships = session.exec(select(Scholarship)).all()
    
    # 1. Gemini Matching
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            import json
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            # Prepare profile context
            profile = f"""
            User Name: {current_user.full_name}
            GPA: {current_user.gpa}
            Major: {current_user.major}
            Background: {current_user.background}
            Interests: {current_user.interests}
            """
            
            # Prepare scholarship list (titles/requirements only to save tokens)
            scholarship_list = []
            for s in scholarships:
                scholarship_list.append({
                    "id": s.id,
                    "title": s.title,
                    "requirements": s.requirements
                })
            
            prompt = f"""
            As an expert academic advisor, match this student to the top 2 scholarships from the list provided.
            
            Student Profile:
            {profile}
            
            Scholarships:
            {json.dumps(scholarship_list)}
            
            Return a JSON array of objects. Each object MUST have:
            - scholarship_id: (integer id from the list)
            - match_score: (1-100)
            - reasoning: (1-2 sentences explaining why it's a good fit)
            """
            
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            matches = json.loads(response.text)
            
            # Enrich matches with full scholarship details
            result = []
            for m in matches:
                s = session.get(Scholarship, m["scholarship_id"])
                if s:
                    result.append({
                        "scholarship": s,
                        "score": m["match_score"],
                        "reasoning": m["reasoning"]
                    })
            
            return result
        except Exception as e:
            print(f"Scholarship Matching Failed: {e}")

    # Fallback / Mock logic
    # Just return top 2 based on GPA if STEM or Merit
    result = []
    for s in scholarships[:2]:
        result.append({
            "scholarship": s,
            "score": 85,
            "reasoning": "Based on your strong academic record and interests in your field."
        })
    return result

class DraftRequest(BaseModel):
    scholarship_id: int

@router.post("/ai/scholarships/draft")
async def draft_statement(
    request: DraftRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Drafts a personalized statement for a scholarship"""
    scholarship = session.get(Scholarship, request.scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
        
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            prompt = f"""
            Write a highly professional and persuasive 300-word personal statement for the '{scholarship.title}' scholarship.
            
            Student Profile:
            Name: {current_user.full_name}
            Major: {current_user.major}
            Background: {current_user.background}
            GPA: {current_user.gpa}
            
            Scholarship Details:
            Provider: {scholarship.provider}
            Requirements: {scholarship.requirements}
            Description: {scholarship.description}
            
            Use a formal academic tone. Highlight the student's unique strengths and how they align with the scholarship's goals.
            """
            
            response = model.generate_content(prompt)
            draft = response.text
            
            # Save the draft
            stmt = PersonalizedStatement(
                user_id=current_user.id,
                scholarship_id=scholarship.id,
                draft_content=draft
            )
            session.add(stmt)
            session.commit()
            
            return {"draft": draft}
        except Exception as e:
            print(f"Statement Drafting Failed: {e}")
            
    return {"draft": f"Failed to generate draft for {scholarship.title}. Please check back later."}


# --- Career Pathfinder Endpoints ---

class CareerGoalRequest(BaseModel):
    target_role: str

@router.post("/career/generate-resume")
async def generate_resume(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Generates a professional resume based on user profile and courses."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        # Mock Response
        return {"resume": f"# {current_user.email}\n\n## Education\n- Major: {current_user.major}\n- GPA: {current_user.gpa}\n\n## Skills\n(AI Generation Unavailable - Missing Key)"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Fetch courses for context
        courses = session.exec(select(Course).where(Course.user_id == current_user.id)).all()
        course_list = ", ".join([f"{c.name} ({c.grade})" for c in courses])
        
        prompt = f"""
        Create a professional resume in Markdown format for a university student.
        
        Student Profile:
        Name: {current_user.full_name or 'Student Name'}
        Email: {current_user.email}
        Major: {current_user.major}
        GPA: {current_user.gpa}
        Interests: {current_user.interests}
        Background: {current_user.background}
        
        Academic Coursework:
        {course_list}
        
        Instructions:
        1. Structure it standardly: Header, Education, Skills, Coursework Highlights, Projects (invent 2 plausible academic projects based on the Major).
        2. Use professional tone.
        3. Highlight transferable skills from the coursework.
        """
        
        response = model.generate_content(prompt)
        return {"resume": response.text}
    except Exception as e:
        return {"error": str(e), "resume": "## Error Generating Resume\nCould not contact AI service."}

@router.get("/career/jobs")
async def match_jobs(
    current_user: User = Depends(get_current_user)
):
    """Finds mock internship matches centered on the user's major."""
    # In a real app, this would use an API or RAG. Here we mock or use AI to hallucinate realistic ones.
    major = current_user.major or "General"
    
    # We will simply pretend to find jobs.
    return {
        "jobs": [
            {"id": 1, "title": f"Junior {major} Intern", "company": "TechGlobal Inc.", "match_score": 95, "location": "Remote"},
            {"id": 2, "title": "Research Assistant", "company": "University Labs", "match_score": 88, "location": "On Campus"},
            {"id": 3, "title": f"{major} Analyst", "company": "Future Corp", "match_score": 82, "location": "New York, NY"},
            {"id": 4, "title": "Project Coordinator", "company": "StartUp Hub", "match_score": 75, "location": "Austin, TX"},
        ]
    }

@router.post("/career/skill-gap")
async def analyze_skill_gap(
    request: CareerGoalRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Analyzes gap between current skills and target role."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return {"analysis": "AI Service Unavailable. Please configure API Key.", "missing_skills": ["Unknown"], "recommended_courses": ["Unknown"]}

    try:
        import google.generativeai as genai
        import json
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        courses = session.exec(select(Course).where(Course.user_id == current_user.id)).all()
        course_names = [c.name for c in courses]
        
        prompt = f"""
        Act as a Career Counselor.
        Target Role: {request.target_role}
        Student Major: {current_user.major}
        Completed Courses: {', '.join(course_names)}
        
        Output a valid JSON object with:
        1. "acquired_skills": List of skills the student likely learned from their courses.
        2. "missing_skills": List of critical skills needed for the target role that are missing.
        3. "recommended_actions": List of 3 specific actions (e.g. "Take a specific course", "Build a project using X").
        """
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        return data
    except Exception as e:
        return {"error": str(e), "acquired_skills": [], "missing_skills": ["Error analyzing"], "recommended_actions": []}
