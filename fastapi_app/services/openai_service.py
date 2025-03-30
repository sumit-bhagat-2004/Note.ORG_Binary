import openai
import os

def correct_text_with_openai(text):
    """Uses OpenAI GPT to fix OCR errors."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("API key not found! Set the OPENAI_API_KEY environment variable.")

    client = openai.OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in correcting OCR errors."},
            {"role": "user", "content": f"Fix OCR mistakes in this structured text:\n{text}"}
        ]
    )
    return response.choices[0].message.content
