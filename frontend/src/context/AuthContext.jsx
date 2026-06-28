import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, logoutUser, registerUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role')
    const accessToken = localStorage.getItem('accessToken')
    if (email && role && accessToken) {
      setUser({ email, role })
    }
    setLoading(false)
  }, [])

  const persistSession = (data) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('email', data.email)
    localStorage.setItem('role', data.role)
    setUser({ email: data.email, role: data.role })
  }

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password })
    persistSession(data)
    return data
  }

  const register = async (fullName, email, password) => {
    const { data } = await registerUser({ fullName, email, password })
    persistSession(data)
    return data
  }

  const logout = async () => {
    try {
      await logoutUser()
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
