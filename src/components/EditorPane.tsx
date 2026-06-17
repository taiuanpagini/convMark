import { useCallback } from 'react'
import { Trash2, Clipboard } from 'lucide-react'

interface EditorPaneProps {
  value: string
  onChange: (value: string) => void
}

export default function EditorPane({ value, onChange }: EditorPaneProps) {
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch {
      // clipboard not available, ignore
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  const charCount = value.length
  const lineCount = value ? value.split('\n').length : 0

  return (
    <div
      data-wb-label="Editor Markdown"
      className="no-print flex flex-col w-1/2 min-w-0 bg-slate-50"
    >
      {/* Pane header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Editor
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-2 hidden sm:inline">
            {lineCount} {lineCount === 1 ? 'linha' : 'linhas'} · {charCount} chars
          </span>
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Colar da área de transferência"
          >
            <Clipboard size={12} />
            <span className="hidden sm:inline">Colar</span>
          </button>
          <button
            onClick={handleClear}
            disabled={!value}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Limpar editor"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        className="editor-textarea flex-1 w-full bg-slate-50 text-slate-800 p-4 sm:p-6"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="# Título do documento

Escreva ou cole seu **Markdown** aqui…

## Seção

- Item 1
- Item 2

> Dica: o preview aparece ao lado em tempo real."
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  )
}
