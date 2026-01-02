"""Enumeration types for models."""
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    USER = "user"
    ADMIN = "admin"

