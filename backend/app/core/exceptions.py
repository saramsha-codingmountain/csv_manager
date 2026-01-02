"""Custom exception classes for the application."""
from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """Base exception class for API errors."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: dict = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundError(BaseAPIException):
    """Resource not found exception."""
    
    def __init__(self, resource: str, identifier: str = None):
        detail = f"{resource} not found"
        if identifier:
            detail += f": {identifier}"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class UnauthorizedError(BaseAPIException):
    """Unauthorized access exception."""
    
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenError(BaseAPIException):
    """Forbidden access exception."""
    
    def __init__(self, detail: str = "Not enough permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class BadRequestError(BaseAPIException):
    """Bad request exception."""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class ValidationError(BaseAPIException):
    """Validation error exception."""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )

