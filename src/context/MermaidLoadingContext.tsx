import { createContext, useContext, useCallback, useState, ReactNode } from 'react'

interface MermaidLoadingContextType {
  incrementLoading: () => void
  decrementLoading: () => void
  isAnyLoading: boolean
}

const MermaidLoadingContext = createContext<MermaidLoadingContextType>({
  incrementLoading: () => {},
  decrementLoading: () => {},
  isAnyLoading: false,
})

export function MermaidLoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)

  const incrementLoading = useCallback(() => setCount(c => c + 1), [])
  const decrementLoading = useCallback(() => setCount(c => Math.max(0, c - 1)), [])

  return (
    <MermaidLoadingContext.Provider
      value={{ incrementLoading, decrementLoading, isAnyLoading: count > 0 }}
    >
      {children}
    </MermaidLoadingContext.Provider>
  )
}

export const useMermaidLoading = () => useContext(MermaidLoadingContext)
