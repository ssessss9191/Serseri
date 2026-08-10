import React, { useState } from "react";
import { X, Copy, Check, Download, Code2, Sparkles, FileJson, Layers } from "lucide-react";
import { generateTypeScriptTypes, generatePydanticModel, generatePythonDataclass } from "../utils/typeGenerator";

interface TypeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonPayload: any;
}

export const TypeGeneratorModal: React.FC<TypeGeneratorModalProps> = ({
  isOpen,
  onClose,
  jsonPayload,
}) => {
  const [activeTab, setActiveTab] = useState<"ts" | "pydantic" | "dataclass">("pydantic");
  const [modelName, setModelName] = useState<string>("ApiResponse");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let generatedCode = "";
  if (activeTab === "ts") {
    generatedCode = generateTypeScriptTypes(jsonPayload, modelName);
  } else if (activeTab === "pydantic") {
    generatedCode = generatePydanticModel(jsonPayload, modelName);
  } else {
    generatedCode = generatePythonDataclass(jsonPayload, modelName);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const ext = activeTab === "ts" ? "ts" : "py";
    const filename = `${modelName.toLowerCase()}_model.${ext}`;
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tür & Veri Modeli Oluşturucu</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Premium
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                JSON verisinden anında Pydantic, TypeScript veya Python Dataclass üretin.
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
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("pydantic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "pydantic"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Python Pydantic
              </button>
              <button
                onClick={() => setActiveTab("ts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "ts"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TypeScript Interface
              </button>
              <button
                onClick={() => setActiveTab("dataclass")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "dataclass"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Python Dataclass
              </button>
            </div>

            {/* Class Name Input */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-400">Model İsmi:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value || "ApiResponse")}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 w-36"
              />
            </div>
          </div>

          {/* Generated Code Display */}
          <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-emerald-300 max-h-80 overflow-y-auto whitespace-pre leading-relaxed select-text scrollbar-thin">
            {generatedCode}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {activeTab === "pydantic" ? "pydantic.BaseModel uyumlu" : activeTab === "ts" ? "TypeScript 4+ uyumlu" : "dataclasses.dataclass"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Modeli Kopyala</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Modeli İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
