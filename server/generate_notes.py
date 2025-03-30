import json
import openai
import os
from config import OPENAI_API_KEY

if not OPENAI_API_KEY:
    raise ValueError("❌ OpenAI API Key is missing! Set the OPENAI_API_KEY environment variable.")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

def fetch_content_from_urls(urls):
    """
    Simulate fetching content from URLs (You need to implement actual web scraping)
    """
    return "\n".join([f"Extracted content from {url}" for url in urls])

def generate_notes(topic, summary, urls):
    """
    Generates notes using OpenAI GPT-4o based on provided URLs.
    """
    website_content = fetch_content_from_urls(urls)

    prompt = f"""
    Title: {topic}
    Summary: {summary}
    
    Based on the following web content, create structured and concise notes:
    {website_content}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4", 
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )

        notes = response.choices[0].message.content.strip()
        return notes

    except Exception as e:
        print(f"❌ OpenAI API Error: {str(e)}")
        return None

def main():
    try:
        with open("search_results.json", "r") as f:
            search_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: search_results.json not found!")
        return

    notes_collection = []

    for item in search_data:
        topic = item["topic"]
        summary = item["summary"]
        urls = item["urls"]

        print(f"📝 Generating notes for: {topic}...")
        notes = generate_notes(topic, summary, urls)

        if notes:
            notes_collection.append({"title": topic, "content": notes})
        else:
            print(f"⚠️ Failed to generate notes for {topic}")

    with open("generated_notes.json", "w") as f:
        json.dump(notes_collection, f, indent=4)
    
    print("✅ Notes saved to generated_notes.json!")

if __name__ == "__main__":
    main()
