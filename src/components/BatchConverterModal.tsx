import React, { useState } from "react";
import { X, Layers, Play, Copy, Check, Download, Sparkles, FileText, Plus, Trash2 } from "lucide-react";
import { fallbackCurlToPythonRequests } from "../utils/curlParser";

interface BatchConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchConverterModal: React.FC<BatchConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [batchInput, setBatchInput] = useState<string>(
    `curl -X GET "https://api.example.com/v1/users" -H "Authorization: Bearer secret_123"\n\ncurl -X POST "https://api.example.com/v1/orders" -H "Content-Type: application/json" -d '{"item": "Laptop", "quantity": 1}'`
  );
  const [outputScript, setOutputScript] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateBatchScript = () => {
    if (!batchInput.trim()) return;

    // Split by curl keyword
    const rawCurls = batchInput
      .split(/(?=curl\s+)/i)
      .map((c) => c.trim())
      .filter((c) => c.length > 5 && c.toLowerCase().startsWith("curl"));

    if (rawCurls.length === 0) {
      setOutputScript("# Geçerli cURL komutu bulunamadı.");
      return;
    }

    let mergedScript = `import asyncio\nimport httpx\nimport json\n\n# ==========================================\n#  Toplu cURL Python Otomasyon Betiği (${rawCurls.length} İstek)\n# ==========================================\n\n`;

    rawCurls.forEach((curlCmd, index) => {
      const fnName = `send_request_${index + 1}`;
      mergedScript += `async function ${fnName}(client: httpx.AsyncClient):\n`;
      mergedScript += `    """cURL İstek #${index + 1}"""\n`;

      // Extract basic params
      const urlMatch = curlCmd.match(/url\s*=\s*["']([^"']+)["']/i) || curlCmd.match(/(https?:\/\/[^\s"'`]+)/i);
      const url = urlMatch ? urlMatch[1] : "https://api.example.com";

      let method = "GET";
      if (/-X\s+POST|--request\s+POST/i.test(curlCmd)) method = "POST";
      else if (/-X\s+PUT|--request\s+PUT/i.test(curlCmd)) method = "PUT";
      else if (/-X\s+DELETE|--request\s+DELETE/i.test(curlCmd)) method = "DELETE";

      mergedScript += `    url = "${url}"\n`;
      mergedScript += `    print(f"🚀 [{index + 1}/${rawCurls.length}] ${method} {url} gönderiliyor...")\n`;
      mergedScript += `    try:\n`;
      mergedScript += `        response = await client.request("${method}", url)\n`;
      mergedScript += `        print(f"✅ [{index + 1}] Statü: {response.status_code}")\n`;
      mergedScript += `        return response.text\n`;
      mergedScript += `    except Exception as e:\n`;
      mergedScript += `        print(f"❌ [{index + 1}] Hata: {e}")\n`;
      mergedScript += `        return None\n\n`;
    });

    mergedScript += `async def main():\n`;
    mergedScript += `    async with httpx.AsyncClient(timeout=30.0) as client:\n`;
    mergedScript += `        tasks = [\n`;
    rawCurls.forEach((_, idx) => {
      mergedScript += `            send_request_${idx + 1}(client),\n`;
    });
    mergedScript += `        ]\n`;
    mergedScript += `        results = await asyncio.gather(*tasks)\n`;
    mergedScript += `        print(f"🎉 Toplam {len(results)} istek tamamlandı!")\n\n`;
    mergedScript += `if __name__ == "__main__":\n`;
    mergedScript += `    asyncio.run(main())\n`;

    setOutputScript(mergedScript);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "batch_automation.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Toplu cURL Dönüştürücü & Asenkron Otomasyon</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Toplu İşlem
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Birden fazla cURL isteğini tek seferde yapıştırın, asenkron Python scriptine dönüştürün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>cURL Komutları (Çoklu Yapıştırma)</span>
            </label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Aralarına boşluk bırakarak birden fazla cURL komutu yapıştırın..."
              className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 resize-none scrollbar-thin"
            />
            <button
              onClick={handleGenerateBatchScript}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Toplu Python Scriptini Üret</span>
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Birleşik Asenkron Script (httpx + asyncio)</span>
              </label>
              {outputScript && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Kopyala"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-300 overflow-y-auto whitespace-pre leading-relaxed select-text scrollbar-thin">
              {outputScript || "# 'Toplu Python Scriptini Üret' butonuna basarak sonucu görün."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
