import React, { useState, useEffect } from "react";
import { Send, Code2, Sparkles, X, CheckCircle2 } from "lucide-react";

export const WelcomeSplash: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-400 ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl overflow-hidden text-center space-y-6 animate-fade-in">
        {/* Glow ambient background elements */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-blue-500/20 blur-3xl rounded-full"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Icon Header */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Code2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        {/* App Title */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Curl2Py Pro</span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Gelişmiş Mobil & Android Uyumlu cURL to Python Dönüştürücü
          </p>
        </div>

        {/* Developer & Telegram Info Cards */}
        <div className="space-y-3 pt-1">
          {/* Developer Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                👨‍💻
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Geliştirici</span>
                <span className="text-xs font-bold text-slate-200">StreetAlone</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded-full">
              Developer
            </span>
          </div>

          {/* Telegram Channel Card */}
          <a
            href="https://t.me/StreetPythonCode"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/50 to-slate-900 border border-sky-500/30 hover:border-sky-400 flex items-center justify-between transition-all group active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-sky-400/80 uppercase font-extrabold tracking-wider block">Telegram Kanalı</span>
                <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">StreetPythonCode</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-sky-500 text-slate-950 px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
              Katıl 🚀
            </span>
          </a>
        </div>

        {/* Progress Bar / Continue */}
        <div className="pt-2">
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Uygulamaya Devam Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
