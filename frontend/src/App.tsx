import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminPanel from './pages/AdminPanel'
import UserPanel from './pages/UserPanel'
import CSVViewPage from './pages/CSVViewPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Signup />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/csv/:fileId/view"
          element={
            <ProtectedRoute>
              <CSVViewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/user') : '/login'} />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

