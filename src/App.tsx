import { useState, useCallback, useRef } from 'react'
import Header from './components/Header'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import HistoryPanel from './components/HistoryPanel'
import { useHistory } from './hooks/useHistory'
import { MermaidLoadingProvider, useMermaidLoading } from './context/MermaidLoadingContext'

const DEFAULT_MARKDOWN = `# Bem-vindo ao ConvMark

Escreva ou cole seu **Markdown** aqui e converta para **PDF** com um clique.

## O que você pode fazer

- ✅ Editar Markdown com preview em tempo real
- ✅ Converter e baixar como PDF
- ✅ Consultar o histórico de conversões anteriores
- ✅ Colar conteúdo direto da área de transferência
- ✅ Diagramas Mermaid renderizados automaticamente

## Formatação suportada

**Negrito**, *itálico*, ~~riscado~~ e \`código inline\`.

### Tabelas

| Recurso     | Suporte |
|-------------|---------|
| Tabelas GFM | ✅      |
| Diagramas   | ✅      |
| Listas      | ✅      |
| Código      | ✅      |
| Citações    | ✅      |

### Diagrama Mermaid

\`\`\`mermaid
graph TD
    A[📝 Markdown] --> B{ConvMark}
    B --> C[👁️ Preview em tempo real]
    B --> D[📄 Download PDF]
    C --> E[✅ Com diagramas Mermaid!]
    D --> E
\`\`\`

### Bloco de código

\`\`\`javascript
function hello(name) {
  return \`Olá, \${name}!\`
}
\`\`\`

> **Dica:** clique em **Baixar PDF** no topo para gerar e salvar seu documento, incluindo todos os diagramas.
`

function extractFilename(markdown: string): string {
  const lines = markdown.trim().split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      return (
        trimmed
          .replace(/^#+\s*/, '')
          .substring(0, 50)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-') || 'documento'
      )
    }
  }
  return 'documento'
}

// AppInner: main app component without context providers
function AppInner() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [showHistory, setShowHistory] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { history, addToHistory, clearHistory, removeFromHistory } = useHistory()
  const { isAnyLoading } = useMermaidLoading()
  // Keep a ref so the async callback always reads the latest value
  const isAnyLoadingRef = useRef(isAnyLoading)
  isAnyLoadingRef.current = isAnyLoading

  const handleDownloadPDF = useCallback(async () => {
    if (isGenerating || !markdown.trim()) return
    setIsGenerating(true)
    addToHistory(markdown)

    // Wait for all Mermaid diagrams to finish rendering.
    // We use the context ref (updated every render) so we never see stale data.
    const maxWait = 30000
    const pollInterval = 200
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      if (!isAnyLoadingRef.current) break
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    // Small buffer so the browser can paint the final SVGs before printing
    await new Promise(resolve => setTimeout(resolve, 300))
    setIsGenerating(false)
    // Let React flush the state update before opening the print dialog
    await new Promise(resolve => setTimeout(resolve, 50))
    window.print()
  }, [markdown, isGenerating, addToHistory])

  const handleLoadFromHistory = useCallback((md: string) => {
    setMarkdown(md)
    setShowHistory(false)
  }, [])

  return (
    <div className="min-h-screen h-screen bg-slate-50 flex flex-col overflow-hidden app-root">
      <Header
        onDownload={handleDownloadPDF}
        onToggleHistory={() => setShowHistory(s => !s)}
        isGenerating={isGenerating}
        showHistory={showHistory}
        hasContent={!!markdown.trim()}
      />

      <main className="flex flex-1 overflow-hidden app-main">
        <div className="flex flex-1 overflow-hidden divide-x divide-slate-200 app-split">
          <EditorPane value={markdown} onChange={setMarkdown} />
          <PreviewPane markdown={markdown} />
        </div>

        {showHistory && (
          <div className="no-print">
            <HistoryPanel
              history={history}
              onLoad={handleLoadFromHistory}
              onRemove={removeFromHistory}
              onClear={clearHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <MermaidLoadingProvider>
      <AppInner />
    </MermaidLoadingProvider>
  )
}
