
from sqlmodel import SQLModel, Field, Session, select
import requests
from bs4 import BeautifulSoup
from typing import List, Optional

# --- Database Model ---
class CIPCode(SQLModel, table=True):
    code: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None

# --- Scraper ---
class CIPScraper:
    URL = "https://apps.highered.texas.gov/index.cfm?page=45C52BAC318E78F0526E9BA9FF3C3F82&type=alphaInd"

    def fetch_data(self) -> List[dict]:
        print(f"Fetching CIP codes from {self.URL}...")
        try:
            resp = requests.get(self.URL, timeout=30)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            table = soup.find('table')
            if not table:
                print("No table found on page.")
                return []

            results = []
            # Skip header row if present
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all(['td', 'th'])
                # Based on analysis: Title is col 0, Code is col 1
                if len(cols) >= 2:
                    title = cols[0].get_text(strip=True)
                    code = cols[1].get_text(strip=True)
                    
                    # Validate code format (XX.XXXX.XX) to distinguish from headers
                    if len(code) >= 6 and '.' in code:
                        results.append({"code": code, "title": title})
            
            print(f"Found {len(results)} CIP codes.")
            return results

        except Exception as e:
            print(f"Error scraping CIP codes: {e}")
            return []

# --- Service ---
def refresh_cip_database(session: Session):
    scraper = CIPScraper()
    data = scraper.fetch_data()
    
    count = 0
    for item in data:
        # Upsert logic
        existing = session.get(CIPCode, item['code'])
        if not existing:
            new_code = CIPCode(**item)
            session.add(new_code)
            count += 1
        else:
            if existing.title != item['title']:
                existing.title = item['title']
                session.add(existing)
                # count += 1 # Update count?

    session.commit()
    return {"status": "success", "added": count, "total": len(data)}
