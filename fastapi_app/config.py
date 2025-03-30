import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    GOOGLE_VISION_API_KEY = os.getenv("GOOGLE_VISION_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MONGO_URI = os.getenv("MONGO_URI")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
