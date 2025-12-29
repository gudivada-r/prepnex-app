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

@app.get("/")
def root():
    return {"message": "API is running", "env_check": {
        "GOOGLE_API_KEY": "present" if os.getenv("GOOGLE_API_KEY") else "missing",
        "DATABASE_URL": "present" if os.getenv("DATABASE_URL") else "missing"
    }}

@app.get("/api/")
def api_root():
    return {"message": "API endpoint working"}

# Try to import the full backend
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
    
    print("✓ Successfully loaded backend")
except Exception as e:
    print(f"✗ Backend import failed: {e}")
    import traceback
    traceback.print_exc()
