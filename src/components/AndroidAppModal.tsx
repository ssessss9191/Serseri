import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Copy,
  Terminal,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"pwa" | "apk" | "qr">("pwa");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Android Cihazınızda Chrome veya Edge kullanarak menüden 'Uygulamayı Yükle' veya 'Ana Ekrana Ekle' seçeneğine basabilirsiniz.");
    }
  };

  const handleDownloadCapacitorScript = () => {
    const scriptContent = `#!/bin/bash
# Curl2Py Pro Android APK Derleme Betiği
echo "🚀 Curl2Py Pro Android Paketleme Başlatılıyor..."
npm install
npm run build
npx @capacitor/cli init "Curl2Py Pro" "com.curl2py.app" --web-dir "dist"
npx @capacitor/cli add android
npx @capacitor/cli copy android
echo "✅ Android Projesi Hazır! Android Studio veya Gradlew ile APK derleyebilirsiniz:"
echo "cd android && ./gradlew assembleDebug"
`;
    const blob = new Blob([scriptContent], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "build-android-apk.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://curl2py.app";
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  const buildScriptText = `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Android & Mobil Uygulama</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">
                  APK / PWA
                </span>
              </h3>
              <p className="text-xs text-slate-400">Android telefonlarda uygulama gibi çalıştırın veya APK olarak indirin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab("pwa")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "pwa"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Hızlı Yükle (PWA / WebAPK)</span>
          </button>
          <button
            onClick={() => setActiveTab("apk")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "apk"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>APK Derle & İndir</span>
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "qr"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Telefonda Aç (QR)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === "pwa" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Doğrudan Android Cihaza Yükleme</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Android cihazınızda ek indirme veya APK izni olmadan tam ekran, internet olmasa bile çevrimdışı çalışan WebAPK uygulaması olarak yükleyebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleInstallPwa}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>{isInstalled ? "Uygulama Yüklendi ✅" : "Android Telefona Tek Tıkla Yükle"}</span>
                  </button>
                </div>
              </div>

              {/* Instructions list */}
              <div className="space-y-2">
                <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Manuel Yükleme Adımları:</h5>
                <ol className="space-y-2 text-xs text-slate-400 pl-4 list-decimal marker:text-emerald-500 marker:font-bold">
                  <li>Android cihazınızda <strong>Google Chrome</strong> veya <strong>Samsung Internet</strong> tarayıcısını açın.</li>
                  <li>Sağ üstteki <strong>üç nokta (⋮)</strong> menüsüne tıklayın.</li>
                  <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> butonuna dokunun.</li>
                  <li>Curl2Py Pro simgesi doğrudan Android uygulama çekmecenize yerleşecektir!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "apk" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Capacitor / Android Studio Derleme Komutu
                  </span>
                  <button
                    onClick={() => copyToClipboard(buildScriptText)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedScript ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? "Kopyalandı" : "Kopyala"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-slate-900 p-3 rounded-xl text-slate-300 overflow-x-auto border border-slate-800/80">
                  {buildScriptText}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadCapacitorScript}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>APK Derleme Scripti İndir (.sh)</span>
                </button>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs transition-all active:scale-95"
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>GitHub Actions APK Artifacts</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  GitHub Actions Otomatik APK Derleyici:
                </p>
                <p>
                  Proje kökündeki <code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded">.github/workflows/build.yml</code> dosyası sayesinde her commit attığınızda Android APK paketi otomatik oluşturulur.
                </p>
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
                <img
                  src={qrCodeApi}
                  alt="Android QR Kodu"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-sm">Android Telefonunuzun Kamerası ile Taratın</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Kameranızı açıp bu QR kodu okutarak uygulamayı anında Android cihazınızda açabilir ve ana ekrana ekleyebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Android 8.0+ Bütün Telefonlarla Tam Uyumlu
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
