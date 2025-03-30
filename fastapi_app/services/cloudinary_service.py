import cloudinary
import cloudinary.uploader
from config import Config

# Configure Cloudinary
cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)

def upload_to_cloudinary(filename: str) -> str:
    response = cloudinary.uploader.upload(filename, resource_type="raw")
    return response["url"]
