"""File handling utilities."""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import BadRequestError, ValidationError


def ensure_upload_directory() -> Path:
    """Ensure the upload directory exists and return its path."""
    upload_dir = Path(settings.upload_directory)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def validate_csv_file(file: UploadFile) -> None:
    """Validate uploaded CSV file."""
    if not file.filename:
        raise BadRequestError("Filename is required")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.allowed_file_extensions:
        raise BadRequestError(
            f"Invalid file type. Allowed extensions: {', '.join(settings.allowed_file_extensions)}"
        )
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size:
        max_size_bytes = settings.max_file_size_mb * 1024 * 1024
        if file.size > max_size_bytes:
            raise ValidationError(
                f"File size exceeds maximum allowed size of {settings.max_file_size_mb}MB"
            )


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and other security issues."""
    # Remove path components
    filename = Path(filename).name
    
    # Remove any remaining dangerous characters
    dangerous_chars = ['..', '/', '\\', '\x00']
    for char in dangerous_chars:
        filename = filename.replace(char, '')
    
    return filename


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename to prevent overwrites."""
    sanitized = sanitize_filename(original_filename)
    stem = Path(sanitized).stem
    suffix = Path(sanitized).suffix
    unique_id = str(uuid.uuid4())[:8]
    return f"{stem}_{unique_id}{suffix}"


def get_file_path(filename: str) -> Path:
    """Get the full path for a file in the upload directory."""
    upload_dir = ensure_upload_directory()
    return upload_dir / filename


def delete_file(file_path: str) -> bool:
    """Safely delete a file."""
    try:
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()
            return True
        return False
    except Exception:
        return False

