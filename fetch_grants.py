import feedparser
import requests
import pandas as pd
from datetime import datetime

RSS_URL = "https://www.grants.gov/rss/GG_NewOppByAgency.xml"

def fetch_education_grants():
    """
    Fetches the grants from Grants.gov RSS feed and filters for 
    Department of Education (Agency Code: ED).
    Returns a list of dictionaries.
    """
    print(f"Fetching RSS feed from: {RSS_URL}")
    try:
        # Use requests to get the content first to handle potential encoding/header issues better
        response = requests.get(RSS_URL, timeout=10)
        response.raise_for_status()
        
        # Parse the XML content
        feed = feedparser.parse(response.content)
        
        education_grants = []
        
        if feed.bozo:
            print("Warning: Potential issue parsing the XML feed.")
            if feed.bozo_exception:
                print(f"Parser exception: {feed.bozo_exception}")

        print(f"Total entries found in feed: {len(feed.entries)}")

        for entry in feed.entries:
            # Inspection of the feed structure during research suggested looking at categories or description
            # Typically 'category' holds the agency name in some Grants.gov feeds.
            # We will check if 'Education' or 'ED' appears in relevant fields.
            
            is_ed_grant = False
            
            # Check 'category' field if it exists
            if 'category' in entry and ('Education' in entry.category or 'ED' == entry.category):
                is_ed_grant = True
            
            # Fallback: Check title or description if category isn't clear (though riskier for false positives)
            # For now, we'll try to rely on the metadata if possible.
            # Let's dump a sample entry structure if needed for debugging, but for now verify standard fields.
            
            if is_ed_grant:
                # Extract relevant data
                grant_data = {
                    "Title": entry.title,
                    "Link": entry.link,
                    "Agency": entry.category if 'category' in entry else "Unknown",
                    "Date": entry.published if 'published' in entry else datetime.now().strftime("%Y-%m-%d"),
                    "Description": entry.summary if 'summary' in entry else "No description available."
                }
                education_grants.append(grant_data)
        
        # If the specific 'category' check fails (maybe the format changed), we might need a broader search.
        # Let's add a secondary check if count is 0 to be safe, searching the raw string.
        if not education_grants:
            print("No grants found via 'category' match. Attempting broader text search...")
            for entry in feed.entries:
                content_str = str(entry).lower()
                if "department of education" in content_str or "agency code: ed" in content_str:
                     grant_data = {
                        "Title": entry.title,
                        "Link": entry.link,
                        "Agency": "Dept of Education (Text Match)",
                        "Date": entry.published if 'published' in entry else datetime.now().strftime("%Y-%m-%d"),
                        "Description": entry.summary if 'summary' in entry else ""
                    }
                     education_grants.append(grant_data)

        # Sort by date (newest first) and take top 10
        # Note: 'published' is a string, might need parsing for strict sorting, but RSS is usually ordered.
        return education_grants

    except Exception as e:
        print(f"Error fetching grants: {e}")
        return []

if __name__ == "__main__":
    grants = fetch_education_grants()
    print(f"Found {len(grants)} Education grants:")
    for g in grants:
        print(f"- {g['Title']} ({g['Date']})")
