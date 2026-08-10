import React, { useState } from "react";
import { HistoryItem } from "../types";
import { History, X, Trash2, Clock, ArrowRight, Search, Copy, Check } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.curlCommand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = async (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Dönüştürme Geçmişi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {history.length} kayıt saklanıyor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Geçmişte ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-800 dark:text-slate-200 focus:border-cyan-500"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
              title="Geçmişi Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {history.length === 0
                ? "Henüz dönüştürme geçmişi yok."
                : "Aramanıza uygun kayıt bulunamadı."}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-cyan-500/50 cursor-pointer transition-all hover:shadow-md group relative"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 transition-colors truncate max-w-[180px]">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.target}
                    </span>
                    <button
                      onClick={(e) => handleCopyCode(e, item.pythonCode, item.id)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Kodu Kopyala"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate mb-2 border border-slate-100 dark:border-slate-850">
                  {item.curlCommand}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-cyan-500 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Yükle <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
