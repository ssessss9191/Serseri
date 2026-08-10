import React from "react";
import { ConversionOptions } from "../types";
import { Sliders, CheckSquare, Square, FileCode2 } from "lucide-react";

interface OptionsBarProps {
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
}

export const OptionsBar: React.FC<OptionsBarProps> = ({ options, setOptions }) => {
  const toggleOption = (key: keyof ConversionOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-3.5 mb-3 text-xs backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 font-extrabold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Python Kod Ayarları</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={options.customFilename}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, customFilename: e.target.value }))
            }
            placeholder="script.py"
            className="w-28 px-2.5 py-1 font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-lg outline-none text-blue-300 focus:border-blue-500 font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => toggleOption("addTryExcept")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            options.addTryExcept
              ? "bg-blue-950/40 border-blue-500/40 text-blue-300 font-semibold"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          {options.addTryExcept ? (
            <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
          )}
          <span>Try / Except Hata Bloğu</span>
        </button>

        <button
          type="button"
          onClick={() => toggleOption("addComments")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            options.addComments
              ? "bg-blue-950/40 border-blue-500/40 text-blue-300 font-semibold"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          {options.addComments ? (
            <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
          )}
          <span>Açıklama Yorumları Ekle</span>
        </button>

        <button
          type="button"
          onClick={() => toggleOption("useSession")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            options.useSession
              ? "bg-blue-950/40 border-blue-500/40 text-blue-300 font-semibold"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          {options.useSession ? (
            <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
          )}
          <span>Session (Oturum) Yapısı</span>
        </button>
      </div>
    </div>
  );
};
