"""
Script to seed an admin user in the database.
Run this after setting up the database.
"""
import sys
from app.core.database import SessionLocal
from app.models.enums import UserRole
from app.services.user_service import UserService
from app.utils.logger import logger

def create_admin_user(username: str = "admin", email: str = "admin@example.com", password: str = "admin123"):
    """Create or update an admin user."""
    db = SessionLocal()
    try:
        existing_user = UserService.get_by_username(db, username)
        if existing_user:
            print(f"User '{username}' already exists. Updating to admin role...")
            existing_user.role = UserRole.ADMIN
            existing_user.email = email
            from app.core.security import get_password_hash
            existing_user.hashed_password = get_password_hash(password)
            db.commit()
            db.refresh(existing_user)
            print(f"User '{username}' updated to admin role with email {email}.")
        else:
            admin_user = UserService.create_user(
                db=db,
                username=username,
                email=email,
                password=password,
                role=UserRole.ADMIN
            )
            print(f"Admin user '{username}' ({email}) created successfully!")
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        db.rollback()
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    email = sys.argv[2] if len(sys.argv) > 2 else "admin@example.com"
    password = sys.argv[3] if len(sys.argv) > 3 else "admin123"
    create_admin_user(username, email, password)

