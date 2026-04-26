import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transaksi from './pages/Transaksi'
import Grafik from './pages/Grafik'
import AIInsight from './pages/AIInsight'
import Budget from './pages/Budget'
import Laporan from './pages/Laporan'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/transaksi" element={<PrivateRoute><Transaksi /></PrivateRoute>} />
      <Route path="/grafik" element={<PrivateRoute><Grafik /></PrivateRoute>} />
      <Route path="/ai" element={<PrivateRoute><AIInsight /></PrivateRoute>} />
      <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
      <Route path="/laporan" element={<PrivateRoute><Laporan /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}