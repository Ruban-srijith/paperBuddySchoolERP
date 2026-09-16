"use client";

import { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Share2, PlusSquare, CheckCircle2, X, Sparkles, Laptop } from "lucide-react";

interface InstallPWAProps {
  variant?: "navbar" | "landing" | "mobile";
  className?: string;
}

export default function InstallPWA({ variant = "navbar", className = "" }: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("desktop");

  useEffect(() => {
    // Detect if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect Platform
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform("ios");
      } else if (/android/.test(ua)) {
        setPlatform("android");
      } else {
        setPlatform("desktop");
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsStandalone(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.error("Error triggering install prompt:", err);
      }
    }
    // If native prompt is not available or dismissed, open the helpful instruction modal
    setShowModal(true);
  };

  if (isStandalone) return null;

  return (
    <>
      {variant === "landing" ? (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#43634e]/50 hover:bg-[#43634e]/80 border border-[#f4f0e6]/25 text-xs font-bold text-[#f4f0e6] shadow-sm transition-all hover:scale-105 cursor-pointer ${className}`}
          title="Install Genesis ERP App"
        >
          <Download className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Download App</span>
        </button>
      ) : variant === "mobile" ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#e5c158] bg-[#e5c158]/10 border border-[#e5c158]/30 hover:bg-[#e5c158]/20 transition-all w-full ${className}`}
        >
          <Download className="w-4 h-4 text-[#e5c158]" />
          <span>Install Genesis ERP App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#e5c158]/20 to-[#e5c158]/10 text-[#e5c158] border border-[#e5c158]/40 hover:border-[#e5c158] hover:bg-[#e5c158]/20 transition-all font-syne text-xs font-bold shadow-[0_0_10px_rgba(229,193,88,0.2)] cursor-pointer hover:scale-105 ${className}`}
          title="Install Genesis ERP App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* PWA Install Guidance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#14251c] border-2 border-[#e5c158]/40 p-6 shadow-2xl text-[#f4f0e6] space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5c158]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[#e5c158] shadow-md">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-syne font-extrabold text-base text-[#f4f0e6]">Install Genesis ERP</h3>
                  <p className="text-[11px] text-[#a3c9b0]">Fast, offline-ready desktop & mobile app</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#a3c9b0] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform-Specific Step Guide */}
            <div className="space-y-3.5 text-xs text-[#e8e2d3]">
              {platform === "ios" ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Smartphone className="w-4 h-4" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">1</span>
                      <span>Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#e5c158]" /> in Safari's bottom toolbar.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">2</span>
                      <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#e5c158]" />.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">3</span>
                      <span>Tap <strong className="text-white">Add</strong> in the top-right corner to finish.</span>
                    </li>
                  </ol>
                </>
              ) : platform === "android" ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Smartphone className="w-4 h-4" />
                    <span>Install on Android (Chrome)</span>
                  </div>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">1</span>
                      <span>Tap the <strong className="text-white">three dots menu (⋮)</strong> in Chrome.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">2</span>
                      <span>Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">3</span>
                      <span>Confirm by tapping <strong className="text-white">Install</strong>.</span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Laptop className="w-4 h-4" />
                    <span>Install on Desktop (Chrome, Edge, Brave)</span>
                  </div>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">1</span>
                      <span>Look for the <strong className="text-white">Install App icon</strong> (⊕ or ⬇) on the right side of your browser URL address bar.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">2</span>
                      <span>Alternatively, click your browser menu <strong className="text-white">(⋮ or ⋯) &gt; Install Genesis ERP</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-none w-5 h-5 rounded-full bg-[#1b3527] border border-[#e5c158]/40 flex items-center justify-center text-[10px] font-bold text-[#e5c158]">3</span>
                      <span>Click <strong className="text-white">Install</strong> in the popup prompt.</span>
                    </li>
                  </ol>
                </>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#43634e]/30 text-[11px] text-[#a3c9b0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>Instant Launch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>Offline Caching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>Full-Screen Mode</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>Zero Installation Size</span>
              </div>
            </div>

            {/* Footer Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#e5c158] hover:bg-[#e5c158]/90 text-[#14251c] font-syne font-bold text-xs transition-all shadow-lg shadow-[#e5c158]/20 cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

