# Changelog

## [2.0.0] - Major Refactoring

### Backend Changes

#### Structure Improvements
- Reorganized code into proper layered architecture
- Separated business logic into service layer
- Moved configuration to `core/` directory
- Organized models, schemas, and utilities into separate modules

#### New Features
- Custom exception classes for better error handling
- Comprehensive logging system
- File upload validation and sanitization
- Database connection pooling
- Health check endpoint
- API versioning (v1)

#### Security Enhancements
- Filename sanitization to prevent path traversal
- File size and type validation
- Improved password hashing
- Better JWT token handling

#### Code Quality
- Added type hints throughout
- Comprehensive docstrings
- Better error messages
- Consistent naming conventions

### Frontend Changes

#### Structure Improvements
- Organized code into proper service layer
- Separated API calls into service classes
- Centralized configuration
- Better type definitions

#### New Features
- WebSocket reconnection with exponential backoff
- Centralized API client with interceptors
- Better error handling
- Loading states
- Constants management

#### Code Quality
- Comprehensive TypeScript types
- Better error handling
- Consistent component structure
- Reusable hooks and services

### Breaking Changes
- API endpoints moved from `/api/auth` to `/api/v1/auth`
- Service classes replace direct API calls
- WebSocket service refactored

### Migration Guide
1. Update API endpoints in frontend to use `/api/v1/` prefix
2. Replace direct API calls with service classes
3. Update WebSocket connection to use new service

