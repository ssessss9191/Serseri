import React, { useState } from "react";
import { X, Key, ShieldCheck, AlertTriangle, Copy, Check, Lock, Calendar, User } from "lucide-react";
import { JwtInfo, extractAndDecodeJwt } from "../utils/jwtDecoder";

interface JwtDecoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  curlCommand: string;
}

export const JwtDecoderModal: React.FC<JwtDecoderModalProps> = ({
  isOpen,
  onClose,
  curlCommand,
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const jwtTokens = extractAndDecodeJwt(curlCommand);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(id);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>JWT & Kimlik Doğrulama Çözücü</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  Auth Inspector
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                cURL içerisindeki Bearer token veya JWT verilerini otomatik çözümler ve sürelerini gösterir.
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
        <div className="p-6 overflow-y-auto space-y-6">
          {jwtTokens.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
              <Lock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">Bu cURL komutunda geçerli bir JWT (JSON Web Token) bulunamadı.</p>
              <p className="text-xs text-slate-500">
                Açık bir Authorization: Bearer eyJ... başlığı ekleyerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            jwtTokens.map((jwt, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Token #{index + 1}</span>
                  </div>

                  {jwt.isExpired ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Süresi Dolmuş (Expired)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      Aktif / Geçerli Token
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Oluşturulma (iat)</span>
                    <span className="text-white font-mono">{jwt.issuedAt || "Belirtilmemiş"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Bitiş Tarihi (exp)</span>
                    <span className={jwt.isExpired ? "text-rose-400 font-mono font-bold" : "text-emerald-400 font-mono font-bold"}>
                      {jwt.expiresAt || "Süresiz"}
                    </span>
                  </div>
                </div>

                {/* Payload JSON */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload İçeriği (Decoded Claims)</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(jwt.payload, null, 2), `payload-${index}`)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      {copiedToken === `payload-${index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>JSON Kopyala</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-amber-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-text scrollbar-thin">
                    {JSON.stringify(jwt.payload, null, 2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
