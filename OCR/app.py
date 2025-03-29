from flask import Flask, request, jsonify
import requests
import json
from PIL import Image, ImageDraw, ImageFont
import openai

app = Flask(__name__)

# 🔹 API Keys (Replace with your own keys)
GOOGLE_VISION_API_KEY = "AIzaSyCNq-FHlIDPETPHEwqRwQuF3CLhVY1yEU4"
VISION_API_URL = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
openai.api_key = "sk-proj SWBHXW0eAu5WiqO6CmImT3BlbkFJUjkPjUiFJyhpZDwtaLyo"


def extract_text_and_coordinates(response):
    text_data = []
    for annotation in response['responses'][0]['textAnnotations'][1:]:  # Skip full text entry
        text_data.append({
            'text': annotation['description'],
            'boundingBox': annotation['boundingPoly']['vertices']
        })
    return text_data


def get_image_size(text_data):
    max_x = max([max(vertex['x'] for vertex in item['boundingBox']) for item in text_data], default=500)
    max_y = max([max(vertex['y'] for vertex in item['boundingBox']) for item in text_data], default=500)
    return (max_x + 20, max_y + 20)


def reconstruct_document(text_data):
    image_size = get_image_size(text_data)
    image = Image.new('RGB', image_size, 'white')
    draw = ImageDraw.Draw(image)
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
    
    for item in text_data:
        box = item['boundingBox']
        text = item['text']
        position = (box[0]['x'], box[0]['y'])
        draw.text(position, text, fill='black', font=font)
    
    image.save("raw_ocr_output.png")
    print("Reconstructed image saved as raw_ocr_output.png")


def correct_text_with_openai(text):
    client = openai.OpenAI(api_key="sk-proj SWBHXW0eAu5WiqO6CmImT3BlbkFJUjkPjUiFJyhpZDwtaLyo")  # ✅ Pass API key here

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert in correcting OCR errors."},
            {"role": "user", "content": f"Fix OCR mistakes in this text: {text}"}
        ]
    )
    return response.choices[0].message.content

def save_text_to_file(filename, text):
    with open(filename, "w", encoding="utf-8") as file:
        file.write(text)
    print(f"Text saved as {filename}")


@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        data = request.get_json()
        image_url = data.get("image_url")

        if not image_url:
            return jsonify({"error": "Missing image URL"}), 400

        # Send request to Google Vision API
        payload = {
            "requests": [{
                "image": {"source": {"imageUri": image_url}},
                "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
            }]
        }
        response = requests.post(VISION_API_URL, json=payload)
        response_json = response.json()

        # Extract text data
        extracted_text = response_json.get("responses", [{}])[0].get("fullTextAnnotation", {}).get("text", "")
        text_data = extract_text_and_coordinates(response_json)
        
        # Save raw OCR output
        save_text_to_file("raw_text.txt", extracted_text)
        
        # Reconstruct document
        reconstruct_document(text_data)
        
        # Correct text with OpenAI
        corrected_text = correct_text_with_openai(extracted_text)
        save_text_to_file("corrected_text.txt", corrected_text)

        return jsonify({
            "message": "Processing complete. Files saved.",
            "raw_text": extracted_text,
            "corrected_text": corrected_text
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
