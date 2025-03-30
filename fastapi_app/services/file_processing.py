import os
from datetime import datetime, time
from models.database import collection
from services.vision import extract_text_from_image
from services.openai_service import correct_text_with_openai
from services.cloudinary_service import upload_to_cloudinary

def process_files():
    today = datetime.now().date()
    start_of_day = datetime.combine(today, time(0, 0, 0))
    end_of_day = datetime.combine(today, time(23, 59, 59))

    query = {"uploadedAt": {"$gte": start_of_day, "$lt": end_of_day}}
    files = list(collection.find(query))
    
    if not files:
        return {"message": "No files to process"}
    
    results = []
    
    for file in files:
        user_id = file["userId"]
        subject = file["subject"].replace(" ", "_")
        date_str = today.strftime("%Y-%m-%d")
        file_url = file["fileUrl"]

        # Filenames
        raw_filename = f"{user_id}_{subject}_{date_str}_raw.txt"
        corrected_filename = f"{user_id}_{subject}_{date_str}_corrected.txt"

        # Extract & Correct Text
        extracted_text = extract_text_from_image(file_url)
        corrected_text = correct_text_with_openai(extracted_text)

        # Save and Upload
        with open(raw_filename, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        with open(corrected_filename, "w", encoding="utf-8") as f:
            f.write(corrected_text)

        raw_url = upload_to_cloudinary(raw_filename)
        corrected_url = upload_to_cloudinary(corrected_filename)

        # Update Database
        collection.update_one(
            {"_id": file["_id"]},
            {"$set": {
                "raw_text_url": raw_url,
                "corrected_text_url": corrected_url
            }}
        )

        results.append({
            "userId": user_id,
            "raw_text_url": raw_url,
            "corrected_text_url": corrected_url
        })

        os.remove(raw_filename)
        os.remove(corrected_filename)

    return {"message": "Processing complete", "results": results}
