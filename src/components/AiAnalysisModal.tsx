import React, { useState } from "react";
import { Bot, X, Sparkles, ShieldAlert, Copy, Check, Download } from "lucide-react";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisText: string;
  isLoading: boolean;
  error?: string;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisText,
  isLoading,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyAnalysis = async () => {
    if (!analysisText) return;
    try {
      await navigator.clipboard.writeText(analysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = analysisText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAnalysis = () => {
    if (!analysisText) return;
    const blob = new Blob([analysisText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "curl-ai-analysis.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Gemini AI cURL Analizi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gelişmiş güvenlik ve yapı incelemesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                Yapay Zeka cURL komutunu inceliyor...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">Analiz Hatası:</strong>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCopyAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Analiz Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Analizi Kopyala</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Analizi İndir</span>
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 font-sans select-text">
                {analysisText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
