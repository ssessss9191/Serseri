import React, { useState, useEffect } from "react";
import { Copy, Check, Download, Play, Bot, Code2, Terminal, Edit3, Eye, Zap, Clock, FileText, Trash2, Plus, Sparkles, Globe } from "lucide-react";
import { PythonTarget } from "../types";

interface CodeViewerProps {
  pythonCode: string;
  target: PythonTarget;
  customFilename: string;
  onLiveTest: () => void;
  onAiAnalyze: () => void;
  isTesting: boolean;
  isAnalyzing: boolean;
}

const SNIPPETS = {
  pythonGet: `import requests

url = "https://jsonplaceholder.typicode.com/posts/1"
headers = {
    "Accept": "application/json",
    "User-Agent": "Curl2Py-Client/1.0"
}

response = requests.get(url, headers=headers)
print("Statü Kodu:", response.status_code)
print(response.json())
`,
  pythonPost: `import requests

url = "https://jsonplaceholder.typicode.com/posts"
headers = {
    "Content-Type": "application/json"
}
json_data = {
    "title": "Yeni Gönderi",
    "body": "Kod editörü üzerinden gönderildi.",
    "userId": 1
}

response = requests.post(url, headers=headers, json=json_data)
print("Statü Kodu:", response.status_code)
print(response.json())
`,
  jsFetch: `const url = "https://jsonplaceholder.typicode.com/posts/1";

fetch(url, {
  method: "GET",
  headers: {
    "Accept": "application/json"
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
`,
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  pythonCode,
  target,
  customFilename,
  onLiveTest,
  onAiAnalyze,
  isTesting,
  isAnalyzing,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableCode, setEditableCode] = useState(pythonCode);

  // Execution runner state
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [outputViewMode, setOutputViewMode] = useState<"code" | "preview">("code");

  // Keep editable state updated when pythonCode prop updates from conversion
  useEffect(() => {
    setEditableCode(pythonCode);
  }, [pythonCode]);

  const activeCode = isEditMode ? editableCode : pythonCode;

  const handleCopyCode = async () => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = activeCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (!activeCode) return;
    
    let filename = customFilename.trim() || "script.py";
    if (!filename.endsWith(".py") && !filename.endsWith(".js")) {
      filename += target.includes("javascript") || target.includes("nodejs") ? ".js" : ".py";
    }

    const blob = new Blob([activeCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Tab key indentation support in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const targetEl = e.currentTarget;
      const start = targetEl.selectionStart;
      const end = targetEl.selectionEnd;

      const indent = "    "; // 4 spaces
      const newValue = editableCode.substring(0, start) + indent + editableCode.substring(end);
      setEditableCode(newValue);

      setTimeout(() => {
        targetEl.selectionStart = targetEl.selectionEnd = start + indent.length;
      }, 0);
    }
  };

  // Run Code and learn response
  const handleRunCode = async () => {
    const codeToRun = isEditMode ? editableCode : pythonCode;
    if (!codeToRun.trim()) return;

    setIsRunningCode(true);
    setCodeOutput(null);

    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToRun,
          target,
        }),
      });

      const data = await res.json();
      if (data.success && data.output) {
        setCodeOutput(data.output);
        setExecutionTimeMs(data.durationMs);
      } else {
        setCodeOutput(`[Çalıştırma Hatası]: ${data.error || "Kod icra edilemedi."}`);
      }
    } catch (err: any) {
      setCodeOutput(`[Ağ Hatası]: ${err.message || "Sunucuya bağlanılamadı."}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleCopyOutput = async () => {
    if (!codeOutput) return;
    try {
      await navigator.clipboard.writeText(codeOutput);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = codeOutput;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  const isOutputHtml = codeOutput ? (codeOutput.includes("<html") || codeOutput.includes("<!DOCTYPE html") || codeOutput.includes("<body") || codeOutput.includes("<div")) : false;

  const handleDownloadOutput = () => {
    if (!codeOutput) return;

    const trimmed = codeOutput.trim();
    const isJson = (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"));
    
    let ext = "txt";
    let mimeType = "text/plain;charset=utf-8";

    if (isJson) {
      ext = "json";
      mimeType = "application/json;charset=utf-8";
    } else if (isOutputHtml) {
      ext = "html";
      mimeType = "text/html;charset=utf-8";
    }

    const filename = `kod_yaniti.${ext}`;

    const blob = new Blob([codeOutput], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codeLines = activeCode ? activeCode.split("\n") : [];
  const lineCount = activeCode ? activeCode.split("\n").length : 0;
  const charCount = activeCode ? activeCode.length : 0;

  return (
    <div className="space-y-4">
      {/* Code Editor Box */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden transition-all">
        {/* Code Window Header Controls */}
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Mac window dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-300 ml-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              {customFilename.endsWith(".py") || customFilename.endsWith(".js")
                ? customFilename
                : `${customFilename || "script"}.${target.includes("javascript") || target.includes("nodejs") ? "js" : "py"}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Mode Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setIsEditMode(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !isEditMode
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Görüntüle</span>
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isEditMode
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kodu Yaz / Düzenle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Snippets Bar in Edit Mode */}
        {isEditMode && (
          <div className="bg-slate-900/40 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Hazır Şablon Ekle:
              </span>
              <button
                onClick={() => setEditableCode(SNIPPETS.pythonGet)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
              >
                Python GET
              </button>
              <button
                onClick={() => setEditableCode(SNIPPETS.pythonPost)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
              >
                Python POST
              </button>
              <button
                onClick={() => setEditableCode(SNIPPETS.jsFetch)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
              >
                JS Fetch
              </button>
            </div>

            <button
              onClick={() => setEditableCode("")}
              className="px-2 py-1 rounded-lg hover:bg-rose-500/10 text-rose-400 text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Temizle</span>
            </button>
          </div>
        )}

        {/* Code Display or Editable Textarea */}
        <div className="relative p-4 sm:p-5 overflow-x-auto max-h-[480px] bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 scrollbar-thin">
          {!activeCode && !isEditMode ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Terminal className="w-10 h-10 text-slate-700 stroke-1" />
              <p className="text-sm">
                Yukarıdaki alana bir cURL komutu yapıştırın veya doğrudan <br />
                <button
                  onClick={() => setIsEditMode(true)}
                  className="text-cyan-400 font-semibold underline hover:text-cyan-300 mt-1"
                >
                  "Kodu Yaz / Düzenle"
                </button>{" "}
                moduna geçerek özgürce kod yazın.
              </p>
            </div>
          ) : isEditMode ? (
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kodunuzu buraya özgürce yazın (Python, JavaScript vb.). Tab tuşu ile girinti ekleyebilirsiniz..."
              className="w-full min-h-[300px] p-2 bg-transparent text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed border-0"
              spellCheck={false}
            />
          ) : (
            <div className="table w-full">
              {codeLines.map((line, index) => (
                <div key={index} className="table-row group hover:bg-slate-900/60">
                  <span className="table-cell text-right select-none pr-4 text-slate-600 font-mono text-[11px] w-8">
                    {index + 1}
                  </span>
                  <span className="table-cell whitespace-pre text-emerald-300/90 leading-relaxed">
                    {formatSyntaxHighlight(line)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Info Footer Bar */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{lineCount} satır • {charCount} karakter</span>
          <span className="text-emerald-400 font-semibold">
            {isEditMode ? "Düzenleme Modu (Canlı)" : "Salt Okunur Mod"}
          </span>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/60 backdrop-blur-md border-t border-slate-800 flex flex-wrap gap-2 sm:gap-3">
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={!activeCode || isRunningCode}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRunningCode ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Kod Çalıştırılıyor...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Kodu Çalıştır & Yanıt Al</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            disabled={!activeCode}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
              copied
                ? "bg-emerald-500 text-slate-950 font-extrabold"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Kodu Kopyala</span>
              </>
            )}
          </button>

          {/* Download Code Button */}
          <button
            onClick={handleDownloadCode}
            disabled={!activeCode}
            className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Kodu İndir</span>
          </button>

          {/* Live Test */}
          <button
            onClick={onLiveTest}
            disabled={!pythonCode || isTesting}
            className="py-3 px-3.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            title="Canlı cURL İsteği Testi"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            <span className="hidden sm:inline">cURL Test</span>
          </button>

          {/* AI Analyze */}
          <button
            onClick={onAiAnalyze}
            disabled={!pythonCode || isAnalyzing}
            className="py-3 px-3.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            title="Yapay Zeka Analizi"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI İncele</span>
          </button>
        </div>
      </div>

      {/* WAF / Local Execution Explanation Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Neden Çevrimiçi Araç ile Yerel Python Arasında Yanıt Farkı Olabilir?</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          Çevrimiçi canlı test sunucumuz Google Cloud veri merkezi IP adreslerini kullanır. Bazı hedef API'ler (<strong>Cloudflare, Akamai, Bot Korumaları, Rate-Limit</strong>) veri merkezi IP'lerinden gelen istekleri otomatik engelleyebilir (403/503). 
          İndirdiğiniz <strong className="text-emerald-400">.py</strong> dosyasını kendi bilgisayarınızda çalıştırdığınızda ev IP adresiniz ve orijinal Python TLS katmanı sayesinde API istediğiniz yanıtı sorunsuz verir.
        </p>
      </div>

      {/* Code Execution Response / Console Output Section */}
      {codeOutput !== null && (
        <div className="bg-slate-950 rounded-3xl border border-cyan-500/40 shadow-2xl overflow-hidden animate-fade-in transition-all">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>Kod İcra Yanıtı & Çıktısı</span>
                {executionTimeMs !== undefined && (
                  <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {executionTimeMs} ms
                  </span>
                )}
              </h3>

              {/* HTML View Switcher if HTML detected */}
              {isOutputHtml && (
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 ml-2">
                  <button
                    onClick={() => setOutputViewMode("code")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      outputViewMode === "code"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Kod
                  </button>
                  <button
                    onClick={() => setOutputViewMode("preview")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
                      outputViewMode === "preview"
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

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition-all active:scale-95"
              >
                {copiedOutput ? (
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
                onClick={handleDownloadOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yanıtı İndir ({isOutputHtml ? ".html" : "txt"})</span>
              </button>
            </div>
          </div>

          {outputViewMode === "preview" && isOutputHtml ? (
            <div className="w-full h-80 bg-white overflow-hidden">
              <iframe
                srcDoc={codeOutput}
                title="HTML Code Output Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="p-4 sm:p-5 bg-slate-950 font-mono text-xs sm:text-sm text-emerald-300 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text scrollbar-thin">
              {codeOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Basic syntax coloring helper for Python/JS display
function formatSyntaxHighlight(line: string): React.ReactNode {
  if (line.trim().startsWith("#") || line.trim().startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const keywords = ["import", "from", "as", "try", "except", "def", "async", "await", "with", "return", "print", "if", "else", "const", "let", "var", "function", "catch"];
  const parts = line.split(/(\s+|[(),={}:"])/);

  return parts.map((part, i) => {
    if (keywords.includes(part)) {
      return (
        <span key={i} className="text-pink-400 font-semibold">
          {part}
        </span>
      );
    }
    if (part.startsWith('"') || part.startsWith("'") || part.endsWith('"') || part.endsWith("'")) {
      return (
        <span key={i} className="text-yellow-200">
          {part}
        </span>
      );
    }
    if (["requests", "httpx", "aiohttp", "urllib3", "asyncio", "json", "fetch", "axios"].includes(part)) {
      return (
        <span key={i} className="text-cyan-400">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
