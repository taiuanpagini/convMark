// Header: top navigation bar with download and history actions
import { Download, History, Loader2, FileText, X } from 'lucide-react'

interface HeaderProps {
  onDownload: () => void
  onToggleHistory: () => void
  isGenerating: boolean
  showHistory: boolean
  hasContent: boolean
}

export default function Header({
  onDownload,
  onToggleHistory,
  isGenerating,
  showHistory,
  hasContent,
}: HeaderProps) {
  const isDisabled = isGenerating || !hasContent

  const buttonLabel = isGenerating ? 'Gerando…' : 'Baixar PDF'

  return (
    <header
      data-wb-label="Header Principal"
      className="no-print flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0 shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <FileText size={15} className="text-white" />
        </div>
        <span className="font-semibold text-slate-800 tracking-tight">
          Conv<span className="text-indigo-600">Mark</span>
        </span>
        <span className="hidden sm:inline text-xs text-slate-400 ml-1">
          Markdown → PDF
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHistory}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            showHistory
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
          title="Ver histórico de conversões"
        >
          {showHistory ? <X size={15} /> : <History size={15} />}
          <span className="hidden sm:inline">
            {showHistory ? 'Fechar' : 'Histórico'}
          </span>
        </button>

        <button
          onClick={onDownload}
          disabled={isDisabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Converter para PDF e baixar"
        >
          {isGenerating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          <span>{buttonLabel}</span>
        </button>
      </div>
    </header>
  )
}
