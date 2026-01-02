"""User management endpoints."""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.user import User
from app.schemas.auth import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.utils.logger import logger

router = APIRouter()


@router.get(
    "/",
    response_model=List[UserResponse],
    summary="List users",
    description="Get a list of all registered users (admin only)"
)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> List[UserResponse]:
    """List all users."""
    users = UserService.get_all_users(db, skip=skip, limit=limit)
    return users


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user",
    description="Update a user account (admin only)"
)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Update a user."""
    updated_user = UserService.update_user(
        db=db,
        user_id=user_id,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role
    )
    if not updated_user:
        raise NotFoundError("User", str(user_id))
    
    logger.info(f"User {user_id} updated by {current_user.username}")
    return updated_user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    description="Delete a user account (admin only)"
)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> None:
    """Delete a user."""
    if user_id == current_user.id:
        raise BadRequestError("Cannot delete your own account")
    
    success = UserService.delete_user(db, user_id)
    if not success:
        raise NotFoundError("User", str(user_id))

