import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { CurlInput } from "./components/CurlInput";
import { TargetSelector } from "./components/TargetSelector";
import { OptionsBar } from "./components/OptionsBar";
import { CodeViewer } from "./components/CodeViewer";
import { PresetsModal } from "./components/PresetsModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { LiveTestModal } from "./components/LiveTestModal";
import { AiAnalysisModal } from "./components/AiAnalysisModal";
import { TypeGeneratorModal } from "./components/TypeGeneratorModal";
import { BatchConverterModal } from "./components/BatchConverterModal";
import { JwtDecoderModal } from "./components/JwtDecoderModal";
import { AndroidAppModal } from "./components/AndroidAppModal";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { exportToPostmanCollection } from "./utils/postmanExporter";
import {
  PythonTarget,
  ConversionOptions,
  HistoryItem,
  LiveTestResult,
  PresetCurl,
} from "./types";
import { parseCurlMetadata, fallbackCurlToPythonRequests, normalizeCurlCommand } from "./utils/curlParser";
import { PRESET_CURLS } from "./data/presets";
import { CheckCircle } from "lucide-react";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to dark for sleek interface

  const [curlCommand, setCurlCommand] = useState<string>(PRESET_CURLS[0].curl);
  const [target, setTarget] = useState<PythonTarget>("python-requests");
  const [pythonCode, setPythonCode] = useState<string>("");
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const [options, setOptions] = useState<ConversionOptions>({
    addTryExcept: true,
    addComments: true,
    useSession: false,
    addTimeout: true,
    customFilename: "script.py",
  });

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("curl_history_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Premium Tool Modals State
  const [isTypeGenOpen, setIsTypeGenOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isJwtOpen, setIsJwtOpen] = useState<boolean>(false);
  const [isAndroidOpen, setIsAndroidOpen] = useState<boolean>(false);

  // Live test state
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [liveTestResult, setLiveTestResult] = useState<LiveTestResult>({ loading: false });

  // AI Analysis state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("curl_history_v1", JSON.stringify(history.slice(0, 30)));
    } catch {
      // Ignore
    }
  }, [history]);

  // Parse cURL metadata live
  const metadata = useMemo(() => {
    return parseCurlMetadata(curlCommand);
  }, [curlCommand]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Main conversion function
  const handleConvert = async () => {
    if (!curlCommand.trim()) return;

    setIsConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curlCommand,
          target,
          options,
        }),
      });

      const data = await res.json();

      if (data.success && data.code) {
        setPythonCode(data.code);
        showToast("Python kodu başarıyla dönüştürüldü! ✨");

        // Save to history
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          title: metadata.url ? `${metadata.method} ${new URL(metadata.url).pathname}` : "cURL İsteği",
          curlCommand: curlCommand.trim(),
          pythonCode: data.code,
          target,
          timestamp: Date.now(),
        };

        setHistory((prev) => [newHistoryItem, ...prev.filter((h) => h.curlCommand !== curlCommand.trim())]);
      } else {
        // Fallback to client-side converter if server returns error or offline
        const fallbackCode = fallbackCurlToPythonRequests(curlCommand);
        setPythonCode(fallbackCode);
        showToast("Python kodu üretildi.");
      }
    } catch {
      // Offline fallback
      const fallbackCode = fallbackCurlToPythonRequests(curlCommand);
      setPythonCode(fallbackCode);
      showToast("Python kodu üretildi.");
    } finally {
      setIsConverting(false);
    }
  };

  // Convert whenever target or options change
  useEffect(() => {
    if (curlCommand.trim()) {
      handleConvert();
    }
  }, [target, options.addTryExcept, options.addComments, options.useSession]);

  const handleClear = () => {
    setCurlCommand("");
    setPythonCode("");
  };

  const handleFormat = () => {
    const norm = normalizeCurlCommand(curlCommand);
    setCurlCommand(norm);
    showToast("cURL komutu temizlendi.");
  };

  const handleSelectPreset = (preset: PresetCurl) => {
    setCurlCommand(preset.curl);
    showToast(`"${preset.title}" şablonu yüklendi.`);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurlCommand(item.curlCommand);
    setTarget(item.target);
    setPythonCode(item.pythonCode);
    showToast("Geçmiş kayıt yüklendi.");
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast("Geçmiş temizlendi.");
  };

  // Live Test Execution
  const handleLiveTest = async () => {
    if (!metadata.url) {
      showToast("Geçerli bir URL bulunamadı.");
      return;
    }

    setIsTestModalOpen(true);
    setLiveTestResult({ loading: true });

    try {
      const res = await fetch("/api/test-curl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: metadata.url,
          method: metadata.method,
          headers: metadata.headers,
          data: metadata.parsedJsonPayload || metadata.dataPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLiveTestResult({
          loading: false,
          status: data.status,
          statusText: data.statusText,
          durationMs: data.durationMs,
          headers: data.headers,
          bodyText: data.bodyText,
          isJson: data.isJson,
        });
      } else {
        setLiveTestResult({
          loading: false,
          error: data.error || "Sunucuya bağlanılamadı.",
        });
      }
    } catch (err: any) {
      setLiveTestResult({
        loading: false,
        error: err.message || "İstek gönderilirken ağ hatası oluştu.",
      });
    }
  };

  // AI Analysis Execution
  const handleAiAnalyze = async () => {
    if (!curlCommand.trim()) return;

    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiError(undefined);

    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curlCommand }),
      });

      const data = await res.json();
      if (data.success) {
        setAiAnalysisText(data.analysis);
      } else {
        setAiError(data.error || "Yapay zeka yanıt veremedi.");
      }
    } catch (err: any) {
      setAiError(err.message || "Ağ hatası oluştu.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Postman Export Handler
  const handleExportPostman = () => {
    const itemsToExport = history.length > 0 ? history : [
      {
        id: "current",
        title: metadata.url ? `${metadata.method} ${new URL(metadata.url).pathname}` : "cURL İstek",
        curlCommand,
        pythonCode,
        target,
        timestamp: Date.now(),
      }
    ];

    const collectionJson = exportToPostmanCollection(itemsToExport);
    const blob = new Blob([collectionJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "curl2py_koleksiyon.postman_collection.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Postman Koleksiyonu (.json) indirildi! 🚀");
  };

  return (
    <div className="relative min-h-screen bg-[#0F172A] text-slate-100 transition-colors font-sans flex flex-col pb-12 overflow-x-hidden">
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Top Header */}
      <WelcomeSplash />
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenTypeGen={() => setIsTypeGenOpen(true)}
        onOpenJwt={() => setIsJwtOpen(true)}
        onOpenAndroid={() => setIsAndroidOpen(true)}
        onExportPostman={handleExportPostman}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4">
        {/* cURL Input Card */}
        <CurlInput
          curlCommand={curlCommand}
          setCurlCommand={setCurlCommand}
          metadata={metadata}
          onConvert={handleConvert}
          onClear={handleClear}
          onFormat={handleFormat}
          onOpenPresets={() => setIsPresetsOpen(true)}
          isConverting={isConverting}
        />

        {/* Target Selector */}
        <TargetSelector target={target} setTarget={setTarget} />

        {/* Options Bar */}
        <OptionsBar options={options} setOptions={setOptions} />

        {/* Code Viewer */}
        <CodeViewer
          pythonCode={pythonCode}
          target={target}
          customFilename={options.customFilename}
          onLiveTest={handleLiveTest}
          onAiAnalyze={handleAiAnalyze}
          isTesting={liveTestResult.loading}
          isAnalyzing={isAiLoading}
        />
      </main>

      {/* Modals & Drawers */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <LiveTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        result={liveTestResult}
      />

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysisText={aiAnalysisText}
        isLoading={isAiLoading}
        error={aiError}
      />

      <TypeGeneratorModal
        isOpen={isTypeGenOpen}
        onClose={() => setIsTypeGenOpen(false)}
        jsonPayload={metadata.parsedJsonPayload || { message: "Örnek Veri", status: 200, items: [1, 2, 3] }}
      />

      <BatchConverterModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
      />

      <JwtDecoderModal
        isOpen={isJwtOpen}
        onClose={() => setIsJwtOpen(false)}
        curlCommand={curlCommand}
      />

      <AndroidAppModal
        isOpen={isAndroidOpen}
        onClose={() => setIsAndroidOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-medium text-xs sm:text-sm px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-500/40 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
