"""CSV service for business logic."""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile
from pathlib import Path
from app.models.csv_file import CSVFile
from app.models.user import User
from app.core.exceptions import NotFoundError
from app.utils.file_utils import (
    validate_csv_file,
    generate_unique_filename,
    get_file_path,
    delete_file as delete_file_util,
)
from app.utils.logger import logger


class CSVService:
    """Service for CSV-related operations."""
    
    @staticmethod
    def upload_file(
        db: Session,
        file: UploadFile,
        uploader: User
    ) -> CSVFile:
        """Upload and save a CSV file."""
        # Validate file
        validate_csv_file(file)
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        file_path = get_file_path(unique_filename)
        
        # Save file to disk
        file_size = 0
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            file_size = len(content)
            buffer.write(content)
        
        # Create database record
        csv_file = CSVFile(
            filename=file.filename,  # Store original filename
            file_path=str(file_path),
            file_size=file_size,
            uploader_id=uploader.id
        )
        
        db.add(csv_file)
        db.commit()
        db.refresh(csv_file)
        
        logger.info(f"CSV file uploaded: {file.filename} by {uploader.username}")
        return csv_file
    
    @staticmethod
    def get_by_id(db: Session, file_id: int) -> Optional[CSVFile]:
        """Get CSV file by ID."""
        return db.query(CSVFile).filter(CSVFile.id == file_id).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[CSVFile]:
        """Get all CSV files with pagination."""
        return (
            db.query(CSVFile)
            .order_by(CSVFile.uploaded_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def delete_file(db: Session, file_id: int) -> bool:
        """Delete a CSV file."""
        csv_file = CSVService.get_by_id(db, file_id)
        if not csv_file:
            return False
        
        # Delete file from disk
        delete_file_util(csv_file.file_path)
        
        # Delete from database
        db.delete(csv_file)
        db.commit()
        
        logger.info(f"CSV file deleted: {csv_file.filename}")
        return True

