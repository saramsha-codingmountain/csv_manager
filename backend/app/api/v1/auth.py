"""Authentication endpoints."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.core.security import create_access_token
from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import UserService
from app.utils.logger import logger

router = APIRouter()


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account (admin only)"
)
async def signup(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Register a new user (admin only)."""
    role = user_data.role if user_data.role else UserRole.USER
    new_user = UserService.create_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        role=role
    )
    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="User login",
    description="Authenticate user with email and receive JWT token"
)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
) -> Token:
    """Authenticate user by email and return JWT token."""
    user = UserService.authenticate(db, user_data.email, user_data.password)
    if not user:
        logger.warning(f"Failed login attempt for email: {user_data.email}")
        raise UnauthorizedError("Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user"
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """Get current user information."""
    return current_user

