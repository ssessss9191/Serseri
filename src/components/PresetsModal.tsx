import React, { useState } from "react";
import { PRESET_CURLS } from "../data/presets";
import { PresetCurl } from "../types";
import { Sparkles, X, ArrowRight, Check } from "lucide-react";

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetCurl) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");

  if (!isOpen) return null;

  const categories = ["Tümü", "JSON / API", "Kimlik Doğrulama", "Form & Dosya", "Gelişmiş", "Temel"];

  const filteredPresets =
    selectedCategory === "Tümü"
      ? PRESET_CURLS
      : PRESET_CURLS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Örnek cURL Şablonları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-tıkla dene ve Python koduna dönüştür
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

        {/* Category Filter Chips */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="pt-3 first:pt-0 cursor-pointer group"
            >
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {preset.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {preset.description}
                </p>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate border border-slate-100 dark:border-slate-850">
                  {preset.curl}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
