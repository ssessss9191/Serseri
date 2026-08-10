import React from "react";
import { PythonTarget } from "../types";
import { Code, Zap, RefreshCw, Box, Globe, Cpu } from "lucide-react";

interface TargetSelectorProps {
  target: PythonTarget;
  setTarget: (target: PythonTarget) => void;
}

interface TargetItem {
  id: PythonTarget;
  label: string;
  badge?: string;
  icon: React.ReactNode;
  desc: string;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  target,
  setTarget,
}) => {
  const targets: TargetItem[] = [
    {
      id: "python-requests",
      label: "requests",
      badge: "Standart",
      icon: <Code className="w-4 h-4 text-emerald-400" />,
      desc: "En yaygın Python HTTP kütüphanesi",
    },
    {
      id: "python-httpx",
      label: "httpx (Sync)",
      badge: "Modern",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      desc: "HTTP/2 destekli senkron istemci",
    },
    {
      id: "python-httpx-async",
      label: "httpx (Async)",
      badge: "Async",
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      desc: "asyncio uyumlu httpx istemcisi",
    },
    {
      id: "python-aiohttp",
      label: "aiohttp",
      badge: "Asenkron",
      icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
      desc: "Yüksek performanslı asyncio istemcisi",
    },
    {
      id: "python-urllib3",
      label: "urllib3",
      badge: "Dahili",
      icon: <Box className="w-4 h-4 text-purple-400" />,
      desc: "Ekstra bağımlılık gerektirmez",
    },
    {
      id: "javascript-fetch",
      label: "JS Fetch",
      badge: "Web",
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      desc: "Tarayıcı & Node.js fetch alternatifi",
    },
  ];

  return (
    <div className="my-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">
          Hedef Kütüphane / Format
        </label>
        <span className="text-[11px] text-slate-500">
          Seçmek için tıklayın
        </span>
      </div>

      {/* Mobile scroll container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {targets.map((t) => {
          const isSelected = target === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTarget(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800/80"
              }`}
            >
              {t.icon}
              <div className="flex flex-col items-start text-left">
                <span className="whitespace-nowrap">{t.label}</span>
              </div>
              {t.badge && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ml-1 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
