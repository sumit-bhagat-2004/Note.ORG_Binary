import requests
from config import Config

VISION_API_URL = f"https://vision.googleapis.com/v1/images:annotate?key={Config.GOOGLE_VISION_API_KEY}"

def extract_text_from_image(image_url: str) -> str:
    payload = {
        "requests": [{
            "image": {"source": {"imageUri": image_url}},
            "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
        }]
    }
    response = requests.post(VISION_API_URL, json=payload)
    response_json = response.json()
    return response_json['responses'][0].get('textAnnotations', [{}])[0].get('description', '')
