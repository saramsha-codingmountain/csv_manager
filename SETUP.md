# Quick Setup Guide

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL installed and running

## Step 1: Database Setup

1. Create PostgreSQL database:
```bash
createdb csv_manager
```

Or using psql:
```sql
CREATE DATABASE csv_manager;
```

## Step 2: Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/csv_manager
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Create admin user:
```bash
python seed_admin.py
```

7. Start server:
```bash
python run.py
# Or
uvicorn app.main:app --reload
```

Server runs on `http://localhost:8000`

## Step 3: Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

**Important:** Change the admin password in production!

## Testing the Application

1. Open `http://localhost:5173` in your browser
2. Log in as admin or create a new user account
3. As admin, you can:
   - Upload CSV files
   - View and delete CSV files
   - Manage users
4. As regular user, you can:
   - View list of CSV files
   - View CSV contents in a table
5. Open multiple browser tabs to see real-time updates when admin uploads/deletes files

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Verify database `csv_manager` exists

### Port Already in Use
- Backend: Change port in `run.py` or uvicorn command
- Frontend: Change port in `vite.config.ts`

### Module Not Found Errors
- Backend: Ensure virtual environment is activated and dependencies are installed
- Frontend: Run `npm install` again

### WebSocket Connection Issues
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify WebSocket URL in `frontend/src/hooks/useWebSocket.ts`

