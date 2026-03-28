import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000'
})

// Otomatis tambahin token ke setiap request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)

// Transaksi
export const getTransactions = () => API.get('/transactions/')
export const createTransaction = (data) => API.post('/transactions/', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)