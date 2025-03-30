from fastapi import APIRouter
from services.file_processing import process_files

router = APIRouter()

@router.post("/process_files")
async def process_files_endpoint():
    result = process_files()
    return result
