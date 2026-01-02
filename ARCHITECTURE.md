# Architecture Documentation

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints (routers)
│   │   └── v1/                # API version 1
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── csv_files.py   # CSV file management endpoints
│   │       ├── users.py       # User management endpoints
│   │       └── websocket.py   # WebSocket endpoints
│   │
│   ├── core/                  # Core application components
│   │   ├── config.py          # Application configuration
│   │   ├── database.py        # Database setup and session management
│   │   ├── dependencies.py    # FastAPI dependencies (auth, etc.)
│   │   ├── exceptions.py      # Custom exception classes
│   │   └── security.py        # Security utilities (JWT, password hashing)
│   │
│   ├── models/                # SQLAlchemy database models
│   │   ├── user.py            # User model
│   │   ├── csv_file.py        # CSV file model
│   │   └── enums.py           # Enumeration types
│   │
│   ├── schemas/               # Pydantic schemas for validation
│   │   ├── auth.py            # Authentication schemas
│   │   ├── csv.py             # CSV-related schemas
│   │   └── common.py          # Common schemas
│   │
│   ├── services/              # Business logic layer
│   │   ├── user_service.py    # User business logic
│   │   └── csv_service.py     # CSV business logic
│   │
│   ├── utils/                 # Utility functions
│   │   ├── file_utils.py      # File handling utilities
│   │   ├── csv_parser.py      # CSV parsing utilities
│   │   └── logger.py          # Logging configuration
│   │
│   ├── websocket/             # WebSocket management
│   │   └── manager.py         # WebSocket connection manager
│   │
│   └── main.py                # FastAPI application entry point
│
├── alembic/                   # Database migrations
├── uploads/                   # Uploaded CSV files storage
├── requirements.txt           # Python dependencies
└── seed_admin.py              # Admin user seeding script
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/                   # API service classes
│   │   ├── auth.service.ts    # Authentication API
│   │   ├── csv.service.ts     # CSV API
│   │   └── users.service.ts   # Users API
│   │
│   ├── components/            # Reusable React components
│   │   └── ProtectedRoute.tsx
│   │
│   ├── config/                # Configuration and constants
│   │   ├── constants.ts       # Application constants
│   │   └── api.ts             # API client configuration
│   │
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useWebSocket.ts    # WebSocket hook
│   │
│   ├── pages/                 # Page components
│   │   ├── Login.tsx          # Login page
│   │   ├── Signup.tsx         # Signup page
│   │   ├── AdminPanel.tsx     # Admin dashboard
│   │   └── UserPanel.tsx      # User dashboard
│   │
│   ├── services/              # Business logic services
│   │   └── websocket.service.ts # WebSocket service
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Main types
│   │   └── api.ts             # API types
│   │
│   ├── App.tsx                 # Main app component
│   └── main.tsx               # Application entry point
│
└── package.json
```

## Key Improvements

### Backend Improvements

1. **Separation of Concerns**
   - Business logic moved to service layer
   - Controllers (routers) only handle HTTP concerns
   - Database models separated from business logic

2. **Error Handling**
   - Custom exception classes with proper HTTP status codes
   - Consistent error responses
   - Proper error logging

3. **Security**
   - File upload validation (size, extension)
   - Filename sanitization to prevent path traversal
   - Proper password hashing with bcrypt
   - JWT token validation

4. **Configuration Management**
   - Centralized configuration in `core/config.py`
   - Environment variable support
   - Type-safe settings with Pydantic

5. **Database**
   - Connection pooling configured
   - Proper session management
   - Cascade deletes for related records

6. **Logging**
   - Structured logging throughout the application
   - Configurable log levels

7. **Code Quality**
   - Type hints throughout
   - Docstrings for all functions
   - Consistent naming conventions
   - Proper dependency injection

### Frontend Improvements

1. **Service Layer**
   - Separated API calls into service classes
   - Centralized error handling
   - Type-safe API responses

2. **Configuration**
   - Constants file for all configuration values
   - Environment variable support
   - Centralized API client with interceptors

3. **WebSocket**
   - Proper reconnection logic with exponential backoff
   - Connection state management
   - Message handler subscription pattern

4. **Type Safety**
   - Comprehensive TypeScript types
   - Proper error types
   - Type-safe API calls

5. **Error Handling**
   - Consistent error handling across components
   - User-friendly error messages
   - Proper error boundaries

6. **Code Organization**
   - Clear separation of concerns
   - Reusable hooks and services
   - Consistent component structure

## Design Patterns Used

1. **Service Layer Pattern**: Business logic separated from controllers
2. **Dependency Injection**: FastAPI dependencies for database and auth
3. **Repository Pattern**: Service classes abstract database access
4. **Singleton Pattern**: WebSocket service instance
5. **Observer Pattern**: WebSocket message handlers
6. **Factory Pattern**: Service class static methods

## Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Token validation on every request

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes with dependencies
   - Admin-only endpoints

3. **File Upload Security**
   - File type validation
   - File size limits
   - Filename sanitization
   - Unique filename generation

4. **API Security**
   - CORS configuration
   - Request validation with Pydantic
   - SQL injection prevention (SQLAlchemy ORM)
   - XSS prevention (React escaping)

## Best Practices Implemented

1. **Backend**
   - RESTful API design
   - Proper HTTP status codes
   - API versioning (v1)
   - Pagination support
   - Comprehensive error messages
   - Logging for debugging

2. **Frontend**
   - Component-based architecture
   - Custom hooks for reusability
   - Proper state management
   - Loading and error states
   - Responsive design with Mantine UI

3. **Code Quality**
   - Type hints/TypeScript throughout
   - Consistent code formatting
   - Meaningful variable names
   - Comprehensive comments
   - DRY (Don't Repeat Yourself) principle

## Testing Considerations

The architecture supports easy testing:
- Service layer can be unit tested independently
- API endpoints can be integration tested
- Database models can be tested with test database
- Frontend services can be mocked for testing

## Future Enhancements

1. Add unit and integration tests
2. Implement rate limiting
3. Add request/response logging middleware
4. Implement refresh tokens
5. Add file compression for large CSVs
6. Implement CSV search/filtering
7. Add pagination for CSV viewing
8. Implement caching layer
9. Add monitoring and metrics
10. Implement CI/CD pipeline

