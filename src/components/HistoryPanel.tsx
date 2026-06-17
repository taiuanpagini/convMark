import { Trash2, RotateCcw, Clock, FileText } from 'lucide-react'
import type { HistoryItem } from '../hooks/useHistory'

interface HistoryPanelProps {
  history: HistoryItem[]
  onLoad: (markdown: string) => void
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function HistoryPanel({
  history,
  onLoad,
  onRemove,
  onClear,
  onClose: _onClose,
}: HistoryPanelProps) {
  return (
    <aside
      data-wb-label="Painel de Histórico"
      className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Histórico</span>
          {history.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
            title="Limpar todo o histórico"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300 p-6">
            <FileText size={36} strokeWidth={1} />
            <p className="text-sm text-center text-slate-400">
              Nenhuma conversão ainda. Gere seu primeiro PDF para ver o histórico aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map(item => (
              <li key={item.id} className="group flex flex-col px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.preview}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">{formatDate(item.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded"
                    title="Remover do histórico"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <button
                  onClick={() => onLoad(item.markdown)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors cursor-pointer self-start"
                >
                  <RotateCcw size={11} />
                  Carregar no editor
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
