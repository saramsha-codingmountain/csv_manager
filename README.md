# CSV Manager

A full-stack application for managing CSV files with role-based access control, real-time updates, and a modern UI.

## Features

- **Authentication & Authorization**
  - User signup and login with JWT tokens
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt

- **Admin Panel**
  - Upload CSV files
  - View list of all CSV files
  - Delete CSV files
  - Manage users (view and delete)

- **User Panel**
  - View list of available CSV files
  - View CSV contents in a table format
  - Real-time updates when files are added/removed

- **Real-Time Updates**
  - WebSocket integration for live updates
  - Automatic UI refresh when admin uploads/deletes files

## Tech Stack

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy (ORM)
- Alembic (Migrations)
- JWT Authentication
- WebSockets

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Mantine UI
- Axios
- React Router

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/csv_manager
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Create the PostgreSQL database:
```bash
createdb csv_manager
```

6. Run migrations:
```bash
alembic upgrade head
```

7. Seed an admin user:
```bash
python seed_admin.py
```

8. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Admin Credentials

After running `seed_admin.py`, you can log in with:
- Username: `admin`
- Password: `admin123`

**Note:** Change the admin password in production!

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)

### CSV Files
- `GET /api/csv/list` - List all CSV files (protected)
- `GET /api/csv/{file_id}/view` - View CSV file contents (protected)
- `POST /api/csv/upload` - Upload a CSV file (admin only)
- `DELETE /api/csv/{file_id}` - Delete a CSV file (admin only)

### Users
- `GET /api/users/` - List all users (admin only)
- `DELETE /api/users/{user_id}` - Delete a user (admin only)

### WebSocket
- `WS /ws/csv-updates` - WebSocket endpoint for real-time updates

## Project Structure

```
csv_manager/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── csv_files.py
│   │   │   ├── users.py
│   │   │   └── websocket.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── websocket_manager.py
│   │   └── main.py
│   ├── alembic/
│   ├── uploads/
│   ├── requirements.txt
│   └── seed_admin.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── README.md
```

## Development Notes

- CSV files are stored in the `backend/uploads/` directory
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- The application uses WebSockets for real-time updates
- All admin operations require JWT authentication with admin role

## License

MIT

