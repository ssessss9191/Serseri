import React, { useState } from "react";
import { History, Sparkles, Moon, Sun, Code2, Layers, Key, FileCode, Download, ChevronDown, Smartphone } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  onOpenBatch: () => void;
  onOpenTypeGen: () => void;
  onOpenJwt: () => void;
  onOpenAndroid: () => void;
  onExportPostman: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenPresets,
  onOpenBatch,
  onOpenTypeGen,
  onOpenJwt,
  onOpenAndroid,
  onExportPostman,
  darkMode,
  setDarkMode,
  historyCount,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/10 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Curl2Py Pro
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO SÜRÜM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              Güçlü cURL - Python Dönüştürücü, Pydantic Model Üretici & Canlı Test
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Android App Download Button */}
          <button
            onClick={onOpenAndroid}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            title="Android & Mobil İndir"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">Android App</span>
          </button>

          {/* Tools Menu */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95 shadow-md shadow-purple-600/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gelişmiş Araçlar</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {toolsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1"
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  onClick={() => {
                    onOpenTypeGen();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-purple-400 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Tür / Pydantic Model Üret</span>
                </button>

                <button
                  onClick={() => {
                    onOpenBatch();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Toplu cURL Dönüştürücü</span>
                </button>

                <button
                  onClick={() => {
                    onOpenJwt();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>JWT & Token Çözücü</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAndroid();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android Uygulama (APK)</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => {
                    onExportPostman();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Postman Koleksiyonu İndir</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 shadow-sm"
            title="Örnek cURL Komutları"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">Örnekler</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 shadow-sm"
            title="Geçmiş Dönüştürmeler"
          >
            <History className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden xs:inline">Geçmiş</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 shadow-sm"
            title={darkMode ? "Açık Tema" : "Koyu Tema"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
