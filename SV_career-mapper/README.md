# AntiGravity - Academic Success Navigator

AntiGravity is an AI-powered multi-agent system designed to support students with academic, administrative, and wellness queries.

## Project Structure

- `backend/`: FastAPI application with LangGraph agent orchestration.
- `frontend/`: React + Vite application with a premium glassmorphism UI.

## Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 16+

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\Activate
# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Running the Application

**Option A: Using Helper Scripts (Windows)**
- Double click `start_backend.cmd` to start the API server.
- Double click `start_frontend.cmd` to start the Web UI.

**Option B: Manual Start**

*Backend:*
```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

*Frontend:*
```bash
cd frontend
npm run dev
```

## Features
- **Multi-Agent Routing**: Intelligently routes queries to Tutor, Admin, or Wellness agents.
- **RAG Integration**: Uses a mock RAG retriever (ChromaDB ready) for policy/academic context.
- **Crisis Protocol**: Detects distress signals and provides immediate emergency resources.
- **Secure Auth**: JWT-based authentication with password hashing.

## Testing
To run the integration tests:
```bash
cd backend
venv\Scripts\python test_integration.py
```
