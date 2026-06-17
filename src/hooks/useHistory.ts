import { useState, useCallback, useEffect } from 'react'

export interface HistoryItem {
  id: string
  title: string
  preview: string
  markdown: string
  createdAt: string
}

const STORAGE_KEY = 'convmark_history'
const MAX_HISTORY = 20

function extractTitle(markdown: string): string {
  const lines = markdown.trim().split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      return trimmed.replace(/^#+\s*/, '').substring(0, 60) || 'Sem título'
    }
  }
  return 'Sem título'
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as HistoryItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // ignore storage errors
    }
  }, [history])

  const addToHistory = useCallback((markdown: string) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      title: extractTitle(markdown),
      preview: markdown.trim().substring(0, 120).replace(/\n/g, ' '),
      markdown,
      createdAt: new Date().toISOString(),
    }
    setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  return { history, addToHistory, clearHistory, removeFromHistory }
}
