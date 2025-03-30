import openai
import os
import pymongo
import requests
from datetime import datetime
from config import OPENAI_API_KEY, MONGO_URI, DATABASE_NAME, COLLECTION_NAME

# Set OpenAI API key
openai.api_key = OPENAI_API_KEY

# Connect to MongoDB
client = pymongo.MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Get today's date in YYYY-MM-DD format
today_date = datetime.utcnow().strftime("%Y-%m-%d")

# Get subject from the user
subject = input("Enter the subject: ").strip()

def fetch_notes_from_mongo(subject, date):
    """ Fetch all notes from MongoDB that match the given subject and date. """
    query = {
        "subject": subject,
        "uploadedAt": {"$gte": datetime.strptime(date, "%Y-%m-%d")}
    }
    notes_cursor = collection.find(query, {"corrected_text_url": 1, "_id": 0})
    
    note_urls = [note["corrected_text_url"] for note in notes_cursor if "corrected_text_url" in note]
    
    if not note_urls:
        raise ValueError(f"No notes found for Subject: {subject} on Date: {date}")

    return note_urls

def download_text_from_url(url):
    """ Download the text content from a given URL. """
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return ""

def generate_super_note(notes):
    """ Uses OpenAI to generate a refined super note by taking the best parts from all imperfect notes. """
    
    prompt = f"""
    You are an AI that refines and improves class notes by combining the best parts of multiple notes.
    
    - Remove any factual errors, spelling mistakes, or irrelevant content.
    - Take the most detailed and accurate portions from each note.
    - Improve readability while keeping all important points.
    - Maintain the original structure and key takeaways.

    ### Here are the notes:
    {notes}

    ### Generate a refined, well-structured super note:
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7  
    )

    return response.choices[0].message.content

note_urls = fetch_notes_from_mongo(subject, today_date)

notes_content = "\n\n".join([download_text_from_url(url) for url in note_urls])

super_note = generate_super_note(notes_content)

os.makedirs("notes", exist_ok=True)
with open("notes/super_note.txt", "w", encoding="utf-8") as file:
    file.write(super_note)

print("✅ AI-generated Super Note saved in 'notes/super_note.txt'.")