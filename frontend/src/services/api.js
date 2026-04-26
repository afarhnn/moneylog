import axios from 'axios'

const API = axios.create({
  baseURL: window.location.origin === 'http://localhost:5173' 
    ? 'http://localhost:8000'  // development
    : ''  // production (same origin via nginx)
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)
export const getTransactions = () => API.get('/transactions/')
export const createTransaction = (data) => API.post('/transactions/', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)
export const getAIInsight = () => API.get('/ai/insight')
export const getBudgets = () => API.get('/budgets/')
export const createBudget = (data) => API.post('/budgets/', data)
export const deleteBudget = (id) => API.delete(`/budgets/${id}`)
export const getLaporanBulanan = (bulan, tahun) => API.get(`/laporan/bulanan?bulan=${bulan}&tahun=${tahun}`)
export const getSemuaBulan = () => API.get('/laporan/semua-bulan')