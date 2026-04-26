/**
 * useTransactions — custom hook for transaction state management.
 * Keeps fetch/create/update/delete logic out of pages.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../api/transactions.api'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memuat transaksi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (data) => {
    await createTransaction(data)
    await fetch()
  }, [fetch])

  const update = useCallback(async (id, data) => {
    await updateTransaction(id, data)
    await fetch()
  }, [fetch])

  const remove = useCallback(async (id) => {
    await deleteTransaction(id)
    await fetch()
  }, [fetch])

  return { transactions, loading, error, refetch: fetch, create, update, remove }
}
