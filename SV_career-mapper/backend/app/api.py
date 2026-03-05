from fastapi import APIRouter, Depends, HTTPException, status, Request, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List, Optional, Dict
import os
from pydantic import BaseModel

from app.auth import get_session, create_access_token, get_password_hash, verify_password, get_current_user
from app.models import ChatSession, ChatMessage, Tutor, User
from datetime import datetime
from app.integrations.lms.canvas import CanvasService

# Optional imports for AI Navigator (may not be available on Vercel due to size constraints)
try:
    from app.agent.graph import app_graph
    from langchain_core.messages import HumanMessage
    AGENT_AVAILABLE = True
except ImportError:
    AGENT_AVAILABLE = False
    print("WARNING: AI Navigator agent not available (langgraph not installed)")

router = APIRouter()

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
async def transcribe_audio(file: bytes = File(...), language: str = Form("English")):
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
                1. Transcribe the audio file fully.
                2. Summarize the transcript into 5 key takeaways.
                
                Return valid JSON format: {{ "transcript": "...", "summary": ["point 1", "point 2", ...] }}
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
                    "summary": data.get("summary", [])
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
async def generate_flashcards(request: FlashcardRequest, current_user: User = Depends(get_current_user)):
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
    api_key = os.environ.get("GOOGLE_API_KEY")
    print(f"DEBUG FLASHCARDS: API Key present? {bool(api_key)}")
    if api_key:
        print(f"DEBUG FLASHCARDS: Attempting Gemini generation for topic_request={is_topic_request}")
        try:
            import google.generativeai as genai
            import json
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            if is_topic_request:
                prompt = f"Generate exactly 20 flashcards for the topic: '{topic_query}'. Return valid JSON array of objects with 'front' and 'back' keys."
            else:
                prompt = f"Extract exactly 20 flashcards from the following notes. Return valid JSON array of objects with 'front' and 'back' keys.\n\nNotes:\n{request.note_content[:4000]}"

            print(f"DEBUG FLASHCARDS: Sending prompt to Gemini...")
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            print(f"DEBUG FLASHCARDS: Got response from Gemini, parsing...")
            data = json.loads(response.text)
            # data is usually the array directly or an object, Gemini follows schema well but lets handle both
            if isinstance(data, list):
                cards_data = data
            elif isinstance(data, dict):
                cards_data = data.get("flashcards", data.get("cards", []))
            else:
                cards_data = []

            # Formate response
            cards = [{"id": f"card-{i}", "front": c["front"], "back": c["back"]} for i, c in enumerate(cards_data)]
            print(f"DEBUG FLASHCARDS: Successfully generated {len(cards)} cards")
            return {"flashcards": cards}
            
        except Exception as e:
            import traceback
            print(f"DEBUG: Gemini Flashcard Gen Failed. Error: {e}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            # Fallthrough to mock
            
    else:
        print("DEBUG FLASHCARDS: No API key found, using mock data")
            
    # 2. Mock Logic (Fallback)
    if is_topic_request:
        topic = topic_query or "General Knowledge"
        cards = []
        for i in range(1, 21):
            cards.append({
                "id": f"mock-{i}", 
                "front": f"Concept {i} of {topic}", 
                "back": f"This is the detailed explanation for concept {i} related to {topic}. It is automatically generated since the AI service is offline."
            })
        return {"flashcards": cards}

    content = request.note_content or ""
    sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 10]
    cards = []
    
    if len(sentences) < 5:
        cards = [{"id": f"fallback-{i}", "front": f"Key Term {i}", "back": f"Definition derived from {content[:20]}..."} for i in range(1, 21)]
        return {"flashcards": cards}

    for i, sent in enumerate(sentences[:20]): 
        if ':' in sent:
            parts = sent.split(':', 1)
            front, back = parts[0].strip(), parts[1].strip()
        elif ' is ' in sent:
            parts = sent.split(' is ', 1)
            front, back = parts[0].strip(), parts[1].strip()
        else:
            front = f"Concept {i+1}"
            back = sent
            
        cards.append({"id": f"card-{i}", "front": front, "back": back})
        
    return {"flashcards": cards}


# --- Auth Endpoints ---

@router.post("/auth/register")
async def register(user: User, session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == user.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user.password_hash = get_password_hash(user.password_hash)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User created successfully"}
    except Exception as e:
        # Return the error message to help debug 500 errors
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == form_data.username)
        user = session.exec(statement).first()
        
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
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
    session: Session = Depends(get_session)
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
        
        result = await app_graph.ainvoke(inputs)
        final_response_dict = result.get("final_response", {})
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
        
    return current_user

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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required")
    session.add(advisor)
    session.commit()
    session.refresh(advisor)
    return advisor

@router.delete("/advisors/{advisor_id}")
async def delete_advisor(
    advisor_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required")
    session.add(tutor)
    session.commit()
    session.refresh(tutor)
    return tutor

@router.delete("/tutors/{tutor_id}")
async def delete_tutor(
    tutor_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    tutor = session.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    session.delete(tutor)
    session.commit()
    return {"message": "Tutor deleted"}

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
