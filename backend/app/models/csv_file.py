"""CSV File model."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# Import User here to avoid circular imports
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class CSVFile(Base):
    """CSV File database model."""
    
    __tablename__ = "csv_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    uploader = relationship("User", back_populates="uploaded_files")

