"""CSV-related schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any


class CSVFileResponse(BaseModel):
    """Schema for CSV file response."""
    id: int
    filename: str
    file_size: int
    uploader_id: int
    uploader_username: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class CSVFileCreate(BaseModel):
    """Schema for creating CSV file record."""
    filename: str
    file_path: str
    file_size: int
    uploader_id: int


class CSVViewResponse(BaseModel):
    """Schema for CSV view response."""
    filename: str
    headers: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    displayed_rows: int = Field(..., description="Number of rows displayed (limited)")

