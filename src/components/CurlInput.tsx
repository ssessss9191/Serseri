import React from "react";
import { Clipboard, Trash2, Wand2, ArrowRight, ShieldCheck, FileJson, Link2, Sparkles, Zap } from "lucide-react";
import { ParsedCurlInfo } from "../types";

interface CurlInputProps {
  curlCommand: string;
  setCurlCommand: (val: string) => void;
  metadata: ParsedCurlInfo;
  onConvert: () => void;
  onClear: () => void;
  onFormat: () => void;
  onOpenPresets: () => void;
  isConverting: boolean;
}

export const CurlInput: React.FC<CurlInputProps> = ({
  curlCommand,
  setCurlCommand,
  metadata,
  onConvert,
  onClear,
  onFormat,
  onOpenPresets,
  isConverting,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCurlCommand(text);
      }
    } catch {
      // Fallback
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "POST":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-3xl border border-slate-700/70 dark:border-slate-800/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-colors">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-slate-300 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 px-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse"></span>
          cURL Komutu
        </label>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all active:scale-95 shadow-sm"
            title="Panodan Yapıştır"
          >
            <Clipboard className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline">Yapıştır</span>
          </button>

          {curlCommand && (
            <>
              <button
                onClick={onFormat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all active:scale-95 shadow-sm"
                title="Komutu Temizle ve Düzelt"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Düzelt</span>
              </button>

              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 transition-all active:scale-95 shadow-sm"
                title="Metni Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Temizle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative group">
        <textarea
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
          placeholder={`Buraya cURL yapıştırın:\n\ncurl 'https://api.example.com/v1/data' \\\n  -H 'Authorization: Bearer token123' \\\n  --data-raw '{"query":"test"}'`}
          className="w-full h-36 sm:h-44 p-4 text-xs sm:text-sm font-mono bg-slate-950/80 border border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-blue-200 placeholder:text-slate-600 resize-none leading-relaxed shadow-inner"
          spellCheck={false}
        />
        
        {!curlCommand && (
          <div className="absolute bottom-3 right-3">
            <button
              onClick={onOpenPresets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Örnek cURL Yükle
            </button>
          </div>
        )}
      </div>

      {/* Metadata Chips Bar */}
      {curlCommand.trim().length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {metadata.method && (
            <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold border ${getMethodBadgeColor(metadata.method)}`}>
              {metadata.method}
            </span>
          )}

          {metadata.url && (
            <span className="flex items-center gap-1 max-w-[200px] sm:max-w-xs truncate px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-300 font-mono border border-slate-700/60">
              <Link2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{metadata.url}</span>
            </span>
          )}

          {metadata.headersCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono">
              {metadata.headersCount} Header
            </span>
          )}

          {metadata.hasAuth && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Auth
            </span>
          )}

          {metadata.hasBody && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              <FileJson className="w-3 h-3" />
              Body ({metadata.bodyType})
            </span>
          )}
        </div>
      )}

      {/* Convert Trigger Button */}
      <div className="mt-4">
        <button
          onClick={onConvert}
          disabled={!curlCommand.trim() || isConverting}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isConverting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Dönüştürülüyor...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-white/20" />
              <span>Dönüştür</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
