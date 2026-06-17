import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText } from 'lucide-react'
import MermaidDiagram from './MermaidDiagram'

interface PreviewPaneProps {
  markdown: string
}

// Stable component map — defined outside component so it never changes reference.
// This prevents ReactMarkdown from unmounting its children on every re-render.
const markdownComponents = {
  code({ className, children }: { className?: string; children?: React.ReactNode }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match?.[1]

    if (language === 'mermaid') {
      return (
        <MermaidDiagram
          code={String(children).replace(/\n$/, '')}
        />
      )
    }

    return (
      <code className={className}>
        {children}
      </code>
    )
  },
}

export default function PreviewPane({ markdown }: PreviewPaneProps) {
  const isEmpty = !markdown.trim()
  // remarkPlugins is stable — defined once, never recreated
  const plugins = useMemo(() => [remarkGfm], [])

  return (
    <div
      data-wb-label="Preview do Documento"
      className="print-preview-pane flex flex-col w-1/2 min-w-0 bg-white"
    >
      {/* Pane header (hidden in print) */}
      <div className="no-print flex items-center justify-between px-4 py-2 border-b border-slate-200 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Preview
        </span>
        <span className="text-xs text-slate-400">A4 · PDF · Mermaid</span>
      </div>

      {/* Content scroll wrapper */}
      <div className="print-preview-scroll flex-1 overflow-auto">
        {isEmpty ? (
          <div className="no-print flex flex-col items-center justify-center h-full gap-3 text-slate-300 p-8">
            <FileText size={48} strokeWidth={1} />
            <p className="text-sm text-center">
              O preview aparecerá aqui conforme você digita
            </p>
          </div>
        ) : (
          <div
            className="print-preview-content prose prose-slate max-w-none px-8 py-8 mx-auto"
            style={{ maxWidth: '740px' }}
          >
            <ReactMarkdown
              remarkPlugins={plugins}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
