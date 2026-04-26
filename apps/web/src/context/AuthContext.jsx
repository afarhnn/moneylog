/**
 * AuthContext — global authentication state.
 * Provides: user, token, login, logout, isAuthenticated
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { login as loginApi } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [nama, setNama] = useState(() => localStorage.getItem('nama') || '')

  // Sync state with localStorage whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('nama')
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password })
    const { access_token, nama } = res.data
    
    // Simpan langsung ke localStorage agar API client bisa langsung membacanya
    localStorage.setItem('token', access_token)
    localStorage.setItem('nama', nama)
    
    setToken(access_token)
    setNama(nama)
    return res.data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setNama('')
  }, [])

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider value={{ token, nama, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to consume auth context — throws if used outside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
