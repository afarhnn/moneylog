import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transaksi from './pages/Transaksi'
import Grafik from './pages/Grafik'
import AIInsight from './pages/AIInsight'
import Budget from './pages/Budget'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/transaksi" element={<PrivateRoute><Transaksi /></PrivateRoute>} />
        <Route path="/grafik" element={<PrivateRoute><Grafik /></PrivateRoute>} />
        <Route path="/ai" element={<PrivateRoute><AIInsight /></PrivateRoute>} />
        <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}