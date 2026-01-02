"""CSV file management endpoints."""
from fastapi import APIRouter, Depends, File, UploadFile, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.csv import CSVFileResponse, CSVViewResponse
from app.services.csv_service import CSVService
from app.utils.csv_parser import parse_csv_file
from app.utils.logger import logger
from app.websocket.manager import manager

router = APIRouter()


@router.post(
    "/upload",
    response_model=CSVFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload CSV file",
    description="Upload a new CSV file (admin only)"
)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> CSVFileResponse:
    """Upload a CSV file."""
    csv_file = CSVService.upload_file(db, file, current_user)
    
    # Broadcast update via WebSocket
    await manager.broadcast({
        "event": "csv_list_updated",
        "action": "uploaded",
        "file": {
            "id": csv_file.id,
            "filename": csv_file.filename,
            "file_size": csv_file.file_size,
            "uploader_id": csv_file.uploader_id,
            "uploader_username": csv_file.uploader.username,
            "uploaded_at": csv_file.uploaded_at.isoformat()
        }
    })
    
    return CSVFileResponse(
        id=csv_file.id,
        filename=csv_file.filename,
        file_size=csv_file.file_size,
        uploader_id=csv_file.uploader_id,
        uploader_username=csv_file.uploader.username,
        uploaded_at=csv_file.uploaded_at
    )


@router.get(
    "/list",
    response_model=List[CSVFileResponse],
    summary="List CSV files",
    description="Get a list of all uploaded CSV files"
)
async def list_csvs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[CSVFileResponse]:
    """List all CSV files."""
    csv_files = CSVService.get_all(db, skip=skip, limit=limit)
    return [
        CSVFileResponse(
            id=file.id,
            filename=file.filename,
            file_size=file.file_size,
            uploader_id=file.uploader_id,
            uploader_username=file.uploader.username,
            uploaded_at=file.uploaded_at
        )
        for file in csv_files
    ]


@router.get(
    "/{file_id}/view",
    response_model=CSVViewResponse,
    summary="View CSV file",
    description="View the contents of a CSV file"
)
async def view_csv(
    file_id: int,
    max_rows: int = Query(100, ge=1, le=1000, description="Maximum rows to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CSVViewResponse:
    """View CSV file contents."""
    csv_file = CSVService.get_by_id(db, file_id)
    if not csv_file:
        raise NotFoundError("CSV file", str(file_id))
    
    # Parse CSV file
    file_path = Path(csv_file.file_path)
    parsed_data = parse_csv_file(file_path, max_rows=max_rows)
    
    return CSVViewResponse(
        filename=parsed_data["filename"],
        headers=parsed_data["headers"],
        rows=parsed_data["rows"],
        total_rows=parsed_data["total_rows"],
        displayed_rows=len(parsed_data["rows"])
    )


@router.get(
    "/{file_id}/download",
    summary="Download CSV file",
    description="Download a CSV file (all authenticated users)"
)
async def download_csv(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> FileResponse:
    """Download a CSV file."""
    csv_file = CSVService.get_by_id(db, file_id)
    if not csv_file:
        raise NotFoundError("CSV file", str(file_id))
    
    file_path = Path(csv_file.file_path)
    if not file_path.exists():
        raise NotFoundError("CSV file", str(file_id))
    
    return FileResponse(
        path=file_path,
        filename=csv_file.filename,
        media_type="text/csv"
    )


@router.delete(
    "/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete CSV file",
    description="Delete a CSV file (admin only)"
)
async def delete_csv(
    file_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> None:
    """Delete a CSV file."""
    success = CSVService.delete_file(db, file_id)
    if not success:
        raise NotFoundError("CSV file", str(file_id))
    
    # Broadcast update via WebSocket
    await manager.broadcast({
        "event": "csv_list_updated",
        "action": "deleted",
        "file_id": file_id
    })

