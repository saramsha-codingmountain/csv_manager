"""User model."""
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.enums import UserRole

# Import CSVFile here to avoid circular imports
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.csv_file import CSVFile


class User(Base):
    """User database model."""
    
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    uploaded_files = relationship("CSVFile", back_populates="uploader", cascade="all, delete-orphan")

