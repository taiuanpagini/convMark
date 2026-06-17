import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useMermaidLoading } from '../context/MermaidLoadingContext'

let mermaidInitialized = false
let idCounter = 0

// Global SVG cache — keyed by diagram code.
// Survives component unmount/remount so clicking "Baixar PDF" never re-renders.
const svgCache = new Map<string, string>()

function setupMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  })
  mermaidInitialized = true
}

// ---------- Serial render queue with true mutex ----------
// Mermaid v11 does NOT support concurrent renders.
// We use a mutex so that only one render is active at any moment.
// When a render times out, we re-init Mermaid before the next one.
type QueueItem = {
  fn: () => Promise<void>
  resolve: () => void
}

const pendingQueue: QueueItem[] = []
let mutexLocked = false

function releaseMutex() {
  mutexLocked = false
  const next = pendingQueue.shift()
  if (next) {
    mutexLocked = true
    next.fn().finally(() => {
      next.resolve()
      releaseMutex()
    })
  }
}

function enqueueRender(fn: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve) => {
    const item: QueueItem = { fn, resolve }
    if (!mutexLocked) {
      mutexLocked = true
      fn().finally(() => {
        resolve()
        releaseMutex()
      })
    } else {
      pendingQueue.push(item)
    }
  })
}
// -----------------------------------------

interface MermaidDiagramProps {
  code: string
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const trimmedCode = code.trim()
  const cached = svgCache.get(trimmedCode)

  const [svg, setSvg] = useState<string | null>(cached ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cached && !!trimmedCode)

  const { incrementLoading, decrementLoading } = useMermaidLoading()
  const incRef = useRef(incrementLoading)
  const decRef = useRef(decrementLoading)
  incRef.current = incrementLoading
  decRef.current = decrementLoading

  useEffect(() => {
    const trimmed = code.trim()
    if (!trimmed) {
      setSvg(null)
      setError(null)
      setLoading(false)
      return
    }

    // Already have a cached SVG — show it immediately, no re-render needed
    if (svgCache.has(trimmed)) {
      setSvg(svgCache.get(trimmed)!)
      setError(null)
      setLoading(false)
      return
    }

    if (!mermaidInitialized) setupMermaid()

    let cancelled = false
    let finished = false

    setSvg(null)
    setError(null)
    setLoading(true)
    incRef.current()

    const id = `mermaid-${++idCounter}`

    function finish() {
      if (!finished) {
        finished = true
        decRef.current()
      }
    }

    // We fire-and-forget the enqueue; cleanup is handled via `cancelled`
    enqueueRender(async () => {
      // If component unmounted while waiting in queue, skip but still add delay
      if (cancelled) {
        finish()
        return
      }

      // Small settling delay between renders so Mermaid can finalize internals
      await new Promise<void>((r) => setTimeout(r, 50))

      if (cancelled) {
        finish()
        return
      }

      const host = document.createElement('div')
      host.style.cssText =
        'position:fixed;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none;width:800px;'
      document.body.appendChild(host)

      let timedOut = false

      await new Promise<void>((resolve) => {
        const safetyTimer = setTimeout(() => {
          timedOut = true
          host.remove()
          // Re-initialize Mermaid so the next render starts clean
          setupMermaid()
          if (!cancelled) {
            setError('Tempo de renderização esgotado. Verifique a sintaxe do diagrama.')
            setLoading(false)
            finish()
          }
          resolve()
        }, 20000)

        mermaid
          .render(id, trimmed, host)
          .then(({ svg: rendered }) => {
            if (timedOut) return // timeout already resolved
            clearTimeout(safetyTimer)
            host.remove()
            if (!cancelled) {
              svgCache.set(trimmed, rendered) // store in cache
              setSvg(rendered)
              setLoading(false)
              finish()
            }
            resolve()
          })
          .catch((err: unknown) => {
            if (timedOut) return
            clearTimeout(safetyTimer)
            host.remove()
            if (!cancelled) {
              const msg = err instanceof Error ? err.message : 'Erro ao renderizar o diagrama'
              setError(msg)
              setLoading(false)
              finish()
            }
            resolve()
          })
      })
    })

    return () => {
      cancelled = true
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  if (loading) {
    return (
      <div className="my-4 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-400">
        <span className="animate-pulse">Renderizando diagrama…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-semibold text-red-600 mb-1">Erro no diagrama Mermaid</p>
        <pre className="text-xs text-red-500 whitespace-pre-wrap font-mono">{error}</pre>
      </div>
    )
  }

  if (!svg) return null

  return (
    // eslint-disable-next-line react/no-danger
    <div
      className="mermaid-diagram-wrapper my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
