"""Authentication-related schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.enums import UserRole


class UserCreate(BaseModel):
    """Schema for user registration."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=6, max_length=100, description="Password")
    role: Optional[UserRole] = Field(None, description="User role (defaults to USER)")


class UserUpdate(BaseModel):
    """Schema for user update."""
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    email: Optional[str] = Field(None, description="Email address")
    password: Optional[str] = Field(None, min_length=6, max_length=100, description="Password")
    role: Optional[UserRole] = Field(None, description="User role")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    username: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    email: Optional[str] = None
    role: Optional[str] = None
