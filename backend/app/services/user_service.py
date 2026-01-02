"""User service for business logic."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import BadRequestError
from app.utils.logger import logger


class UserService:
    """Service for user-related operations."""
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_user(
        db: Session,
        username: str,
        email: str,
        password: str,
        role: UserRole = UserRole.USER
    ) -> User:
        """Create a new user."""
        # Check if user already exists by username
        existing_user = UserService.get_by_username(db, username)
        if existing_user:
            raise BadRequestError("Username already registered")
        
        # Check if email already exists
        existing_email = UserService.get_by_email(db, email)
        if existing_email:
            raise BadRequestError("Email already registered")
        
        hashed_password = get_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User created: {username} ({email}) with role {role.value}")
        return new_user
    
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email."""
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        logger.info(f"User authenticated: {email}")
        return user
    
    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users with pagination."""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        username: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        role: Optional[UserRole] = None
    ) -> Optional[User]:
        """Update a user."""
        user = UserService.get_by_id(db, user_id)
        if not user:
            return None
        
        # Check if username is being changed and if it's already taken
        if username and username != user.username:
            existing_user = UserService.get_by_username(db, username)
            if existing_user:
                raise BadRequestError("Username already registered")
            user.username = username
        
        # Check if email is being changed and if it's already taken
        if email and email != user.email:
            existing_email = UserService.get_by_email(db, email)
            if existing_email:
                raise BadRequestError("Email already registered")
            user.email = email
        
        # Update password if provided
        if password:
            user.hashed_password = get_password_hash(password)
        
        # Update role if provided
        if role is not None:
            user.role = role
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"User updated: {user.username} ({user.email})")
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = UserService.get_by_id(db, user_id)
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        logger.info(f"User deleted: {user.username}")
        return True

