import React, { useState } from "react";
import { LiveTestResult } from "../types";
import { X, Play, Clock, CheckCircle2, AlertTriangle, Code, Server, Copy, Check, Download, Eye, Globe, Sparkles } from "lucide-react";

interface LiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LiveTestResult;
}

export const LiveTestModal: React.FC<LiveTestModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  if (!isOpen) return null;

  const isSuccess = result.status && result.status >= 200 && result.status < 300;

  const bodyText = result.bodyText || "";
  const isHtml = bodyText.includes("<html") || bodyText.includes("<!DOCTYPE html") || bodyText.includes("<body") || bodyText.includes("<div");
  const isCloudflare = bodyText.includes("Just a moment...") || bodyText.includes("Cloudflare") || bodyText.includes("cf-browser-verification");

  const handleCopyBody = async () => {
    if (!result.bodyText) return;
    try {
      await navigator.clipboard.writeText(result.bodyText);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.bodyText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleDownloadBody = () => {
    if (!result.bodyText) return;
    const isJson = result.isJson;
    let extension = "txt";
    let mimeType = "text/plain;charset=utf-8";

    if (isJson) {
      extension = "json";
      mimeType = "application/json;charset=utf-8";
    } else if (isHtml) {
      extension = "html";
      mimeType = "text/html;charset=utf-8";
    }

    const filename = `response.${extension}`;
    
    const blob = new Blob([result.bodyText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHeaders = async () => {
    if (!result.headers) return;
    const headerStr = JSON.stringify(result.headers, null, 2);
    try {
      await navigator.clipboard.writeText(headerStr);
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Play className="w-5 h-5 fill-cyan-500/20" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Canlı API Test Sonucu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerçek HTTP isteği yanıtı ve başlıkları
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
          {result.loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Sunucuya istek gönderiliyor...
              </p>
            </div>
          ) : result.error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">İstek Başarısız Oldu:</strong>
                <p className="font-mono">{result.error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono text-xs flex items-center gap-1.5 ${
                      isSuccess
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {result.status} {result.statusText}
                  </span>
                </div>

                {result.durationMs !== undefined && (
                  <span className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{result.durationMs} ms</span>
                  </span>
                )}
              </div>

              {/* Response Headers */}
              {result.headers && Object.keys(result.headers).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      Yanıt Başlıkları (Headers)
                    </label>
                    <button
                      onClick={handleCopyHeaders}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      {copiedHeaders ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Başlıkları Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                    {Object.entries(result.headers).map(([k, v]) => (
                      <div key={k} className="flex">
                        <span className="text-cyan-400 font-semibold mr-2">{k}:</span>
                        <span className="text-slate-300 truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Body */}
              <div>
                {/* HTML / WAF Warning Notice */}
                {isHtml && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span>API HTML Yanıtı Döndürdü</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {isCloudflare
                        ? "Cloudflare veya Bot Güvenlik duvarı bulut sunucusu IP'sini engellediği için JSON yerine HTML doğrulama sayfası döndü. Kodu indirip yerel bilgisayarınızda çalıştırırsanız JSON verisini alırsınız."
                        : "API bir JSON verisi yerine web sayfası (HTML) döndürdü. Oturum süresi dolmuş veya hatalı bir yönlendirme adresi olabilir."}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-slate-400" />
                      Yanıt İçeriği
                    </label>

                    {/* HTML View Switcher */}
                    {isHtml && (
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => setViewMode("code")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            viewMode === "code"
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Kod
                        </button>
                        <button
                          onClick={() => setViewMode("preview")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
                            viewMode === "preview"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          <span>Sayfa Önizleme</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {result.bodyText && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyBody}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all active:scale-95"
                      >
                        {copiedBody ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDownloadBody}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Yanıtı İndir ({isHtml ? ".html" : result.isJson ? ".json" : ".txt"})</span>
                      </button>
                    </div>
                  )}
                </div>

                {viewMode === "preview" && isHtml ? (
                  <div className="w-full h-72 rounded-xl bg-white border border-slate-800 overflow-hidden">
                    <iframe
                      srcDoc={result.bodyText}
                      title="HTML Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text scrollbar-thin">
                    {result.bodyText || "(Boş Yanıt)"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
