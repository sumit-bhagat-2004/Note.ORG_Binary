import json
import time
from googlesearch import search

def fetch_search_results(query):
    """ Fetch top 4 Google search results for a given query """
    print(f"🔍 Searching for: {query}")
    try:
        results = list(search(query, num_results=4)) 
        print(f"✅ Found {len(results)} results: {results}")
        return results
    except Exception as e:
        print(f"❌ Error searching Google: {str(e)}")
        return []

def main():
    try:
        with open("teacher_notes.json", "r") as f:
            topics = json.load(f)
    except FileNotFoundError:
        print("❌ Error: teacher_notes.json not found!")
        return

    search_results = []
    
    for item in topics:
        topic = item["topic"]
        summary = item["summary"]
        query = f"{topic} {summary}"
        
        urls = fetch_search_results(query)
        search_results.append({"topic": topic, "summary": summary, "urls": urls})
        
        time.sleep(2) 

    with open("search_results.json", "w") as f:
        json.dump(search_results, f, indent=4)
    
    print("✅ search_results.json created successfully!")

if __name__ == "__main__":
    main()
