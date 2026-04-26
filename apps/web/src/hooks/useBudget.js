/**
 * useBudget — custom hook for budget state management.
 */
import { useCallback, useEffect, useState } from 'react'
import { createBudget, deleteBudget, getBudgets } from '../api/budget.api'

export function useBudget() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBudgets()
      setBudgets(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memuat budget')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (data) => {
    await createBudget(data)
    await fetch()
  }, [fetch])

  const remove = useCallback(async (id) => {
    await deleteBudget(id)
    await fetch()
  }, [fetch])

  return { budgets, loading, error, refetch: fetch, create, remove }
}
