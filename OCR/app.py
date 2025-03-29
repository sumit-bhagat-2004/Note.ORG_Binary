from flask import Flask, request, jsonify
import os
import requests
import json
import cloudinary
import cloudinary.uploader
from pymongo import MongoClient
from datetime import datetime, timezone, time
import openai

app = Flask(__name__)

# 🔹 API Keys (Replace with your own)
GOOGLE_VISION_API_KEY = "AIzaSyCNq-FHlIDPETPHEwqRwQuF3CLhVY1yEU4"
VISION_API_URL = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
openai.api_key = "sk-proj-SWBHXW0eAu5WiqO6CmImT3BlbkFJUjkPjUiFJyhpZDwtaLyo"

# 🔹 MongoDB Connection
client = MongoClient("mongodb+srv://sowdarjya:kXmIwoEWe9E8xaDq@cluster0.8idcvwz.mongodb.net/Note-ORG?retryWrites=true&w=majority")
db = client["Note-ORG"]
collection = db["notes"]

# 🔹 Configure Cloudinary
cloudinary.config(
    cloud_name="dgyv898dh",
    api_key="493972163223167",
    api_secret="tgCJbpBJwOUnRe-zoLSFHBZVGcY"
)

def extract_text_from_image(image_url):
    """Extracts text from an image using Google Vision API."""
    payload = {
        "requests": [{
            "image": {"source": {"imageUri": image_url}},
            "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
        }]
    }
    response = requests.post(VISION_API_URL, json=payload)
    response_json = response.json()
    return response_json['responses'][0].get('textAnnotations', [{}])[0].get('description', '')

def correct_text_with_openai(text):
    """Uses OpenAI GPT to fix OCR errors."""
    client = openai.OpenAI(api_key="sk-proj-SWBHXW0eAu5WiqO6CmImT3BlbkFJUjkPjUiFJyhpZDwtaLyo")

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in correcting OCR errors."},
            {"role": "user", "content": f"Fix OCR mistakes in this structured text:\n{text}"}
        ]
    )
    return response.choices[0].message.content

def save_text_to_file(filename, text):
    """Saves extracted text to a file."""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)

def upload_to_cloudinary(filename):
    """Uploads a file to Cloudinary and returns the URL."""
    response = cloudinary.uploader.upload(filename, resource_type="raw")
    return response["url"]

@app.route('/process_files', methods=['POST'])
def process_files():
    """Processes all files uploaded between 12:00 AM and 8:00 PM."""
    try:
        today = datetime.now().date()
        start_of_day = datetime.combine(today, time(0, 0, 0))
        end_of_8pm = datetime.combine(today, time(23, 59, 59))

        query = {"uploadedAt": {"$gte": start_of_day, "$lt": end_of_8pm}}
        files = list(collection.find(query))
        if not files:
            return jsonify({"message": "No files to process"}), 200

        results = []

        for file in files:
            user_id = file["userId"]
            subject = file["subject"].replace(" ", "_")  # Avoid spaces in filename
            date_str = today.strftime("%Y-%m-%d")
            file_url = file["fileUrl"]

            # Define filenames
            raw_filename = f"{user_id}_{subject}_{date_str}_raw.txt"
            corrected_filename = f"{user_id}_{subject}_{date_str}_corrected.txt"

            # Extract text using Google Vision API
            extracted_text = extract_text_from_image(file_url)
            save_text_to_file(raw_filename, extracted_text)

            # Correct text with OpenAI
            corrected_text = correct_text_with_openai(extracted_text)
            save_text_to_file(corrected_filename, corrected_text)

            # Upload files to Cloudinary
            raw_url = upload_to_cloudinary(raw_filename)
            corrected_url = upload_to_cloudinary(corrected_filename)

            # Update the database with extracted details
            collection.update_one(
                {"_id": file["_id"]},
                {"$set": {
                    "filename": raw_filename,
                    "raw_text_url": raw_url,
                    "corrected_text_url": corrected_url
                }}
            )

            results.append({
                "userId": user_id,
                "filename": raw_filename,
                "raw_text_url": raw_url,
                "corrected_text_url": corrected_url
            })

            # Cleanup local files
            os.remove(raw_filename)
            os.remove(corrected_filename)

        return jsonify({"message": "Processing complete", "results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
