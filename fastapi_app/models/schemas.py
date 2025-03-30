from pydantic import BaseModel
from typing import Optional

class FileSchema(BaseModel):
    userId: str
    subject: str
    fileUrl: str
    uploadedAt: Optional[str]  # ISO format datetime
