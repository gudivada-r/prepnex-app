import requests
import json
import os
import google.generativeai as genai
from typing import List, Dict, Any

# Configure Gemini
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class TexasAccountabilityScraper:
    BASE_URL = "https://www.txhigheredaccountability.org/AcctPublic"
    
    SECTORS = {
        "universities": 1,
        "twoYear": 2,
        "healthRelated": 4, # Approximation based on investigation
    }

    def fetch_all_institutions(self) -> List[Dict[str, Any]]:
        """
        Fetches a list of all institutions from the major sectors.
        """
        all_colleges = []
        
        for sector, type_id in self.SECTORS.items():
            try:
                url = f"{self.BASE_URL}/Home/GetInstitutions?sector={sector}"
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.json()
                    # Data is usually [{"Text": "Name", "Value": "ID"}, ...]
                    for item in data:
                        all_colleges.append({
                            "id": item["Value"],
                            "name": item["Text"],
                            "sector": sector,
                            "type_id": type_id
                        })
            except Exception as e:
                print(f"Error fetching sector {sector}: {e}")
                
        return all_colleges

    def fetch_college_metrics(self, inst_id: str, sector: str, type_id: int) -> Dict[str, Any]:
        """
        Fetches metrics for a specific college (Goal 40 - Student Success).
        1. Get Reports for Goal 40.
        2. Fetch Table Data for the first significant report.
        """
        metrics_data = {}
        
        # 1. Get Reports for Goal 40
        reports_url = f"{self.BASE_URL}/Reports/GetReportsByGoal?goalId=40&instId={inst_id}&sector={sector}"
        try:
            resp = requests.get(reports_url)
            reports = resp.json()
            
            # Filter for a good summary report (e.g., Graduation Rate, Degrees)
            # For prototype, we'll fetch data for the first 3 reports to get a good context
            target_reports = reports[:3] 
            
            raw_tables = []
            
            for report in target_reports:
                report_id = report.get("ReportId")
                report_title = report.get("ReportTitle")
                
                # 2. Fetch Table Data
                payload = {
                    "ReportId": report_id,
                    "InstId": inst_id,
                    "InstTypeId": str(type_id)
                }
                
                table_resp = requests.post(f"{self.BASE_URL}/Reports/GetTableData", json=payload)
                if table_resp.status_code == 200:
                    table_data = table_resp.json()
                    raw_tables.append({
                        "title": report_title,
                        "data": table_data
                    })
            
            metrics_data["reports"] = raw_tables
            
        except Exception as e:
            metrics_data["error"] = str(e)
            
        return metrics_data

    def generate_insights(self, college_name: str, metrics_data: Dict[str, Any]) -> str:
        """
        Uses Gemini to analyze the scraped metrics.
        """
        if not GOOGLE_API_KEY:
            return "Gemini API Key not configured."

        if "error" in metrics_data:
            return f"Could not fetch data to analyze: {metrics_data['error']}"

        # Construct Prompt
        # Minimize logic, strip large arrays to keep context small
        reports_summary = json.dumps(metrics_data.get("reports", []), default=str)[:10000] # Limit size
        
        prompt = f"""
        You are an expert Higher Education Data Analyst.
        Analyze the following accountability data for **{college_name}**.
        
        Data (JSON):
        {reports_summary}
        
        Please provide:
        1. three key insights regarding Student Success (Goal 40).
        2. Identify any concerning trends (e.g. declining graduation rates).
        3. Compare performance against implicit expectations for this sector.
        
        Keep the response professional, concise, and formatted in Markdown.
        """
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
             return f"AI Analysis Failed: {e}"
