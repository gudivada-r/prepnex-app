from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Create minimal app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import the module
from api.texas_analytics import TexasAccountabilityScraper
scraper = TexasAccountabilityScraper()

@app.get("/api/texas/colleges")
def get_colleges():
    print("Fetching Colleges...")
    return scraper.fetch_all_institutions()

class AnalyzeReq(BaseModel):
    instId: str
    sector: str
    typeId: int
    name: str

@app.post("/api/texas/analyze")
def analyze(req: AnalyzeReq):
    print(f"Analyzing {req.name}...")
    data = scraper.fetch_college_metrics(req.instId, req.sector, req.typeId)
    insight = scraper.generate_insights(req.name, data)
    return {
        "college": req.name,
        "data_summary": data,
        "ai_insight": insight,
        "source": "live_scrape_test"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
