"""FastAPI dependencies for authentication and authorization."""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.models.user import User
from app.models.enums import UserRole
from app.services.user_service import UserService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user."""
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        email: Optional[str] = payload.get("sub")
        
        if email is None:
            raise UnauthorizedError()
        
        user = UserService.get_by_email(db, email)
        if user is None:
            raise UnauthorizedError()
        
        return user
    except (ValueError, KeyError):
        raise UnauthorizedError()


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to ensure the current user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenError("Admin access required")
    return current_user

