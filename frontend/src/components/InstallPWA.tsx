"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Laptop } from "lucide-react";

interface InstallPWAProps {
  variant?: "navbar" | "landing" | "mobile";
  className?: string;
}

export default function InstallPWA({ variant = "navbar", className = "" }: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if early capture in <head> already caught beforeinstallprompt
    if (typeof window !== "undefined") {
      if ((window as any).__pb_deferred_prompt) {
        setDeferredPrompt((window as any).__pb_deferred_prompt);
      }

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
      (window as any).__pb_deferred_prompt = e;
      setDeferredPrompt(e);
    };

    const handlePwaReady = () => {
      if (typeof window !== "undefined" && (window as any).__pb_deferred_prompt) {
        setDeferredPrompt((window as any).__pb_deferred_prompt);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pb_pwa_ready", handlePwaReady);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      (window as any).__pb_deferred_prompt = null;
      setShowModal(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pb_pwa_ready", handlePwaReady);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? (window as any).__pb_deferred_prompt : null);
    
    if (promptEvent && typeof promptEvent.prompt === "function") {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setIsStandalone(true);
          setDeferredPrompt(null);
          if (typeof window !== "undefined") {
            (window as any).__pb_deferred_prompt = null;
          }
          return;
        }
      } catch (err) {
        console.error("Error triggering install prompt:", err);
      }
    }
    // If native prompt is not available or dismissed, open the helpful instruction modal
    setShowModal(true);
  };

  const handleDownloadLauncher = () => {
    const launcherContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Genesis ERP</title>
  <link rel="icon" href="https://genisis-seven.vercel.app/icon-192x192.png">
  <link rel="manifest" href="https://genisis-seven.vercel.app/manifest.json">
  <meta name="theme-color" content="#122218">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta http-equiv="refresh" content="0; url=https://genisis-seven.vercel.app/dashboard">
  <style>
    body {
      background: #14251c;
      color: #f4f0e6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .logo { width: 72px; height: 72px; border-radius: 18px; border: 2px solid #e5c158; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; margin: 0 0 8px 0; color: #f4f0e6; }
    p { font-size: 13px; color: #a3c9b0; margin: 0 0 20px 0; }
    a { background: #e5c158; color: #14251c; font-weight: bold; text-decoration: none; padding: 10px 24px; border-radius: 20px; }
  </style>
</head>
<body>
  <img src="https://genisis-seven.vercel.app/icon-192x192.png" alt="Genesis ERP" class="logo">
  <h1>Genesis School ERP</h1>
  <p>Launching autonomous portal...</p>
  <a href="https://genisis-seven.vercel.app/dashboard">Open Genesis ERP</a>
  <script>
    window.location.replace("https://genisis-seven.vercel.app/dashboard");
  </script>
</body>
</html>`;

    const blob = new Blob([launcherContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Genesis-ERP-Launcher.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (isStandalone) return null;

  return (
    <>
      {variant === "landing" ? (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#43634e]/50 hover:bg-[#43634e]/80 border border-[#f4f0e6]/25 text-xs font-bold text-[#f4f0e6] shadow-sm transition-all hover:scale-105 cursor-pointer ${className}`}
          title="Download & Install Genesis ERP App"
        >
          <Download className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Download App</span>
        </button>
      ) : variant === "mobile" ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#e5c158] bg-[#e5c158]/10 border border-[#e5c158]/30 hover:bg-[#e5c158]/20 transition-all w-full cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-[#e5c158]" />
          <span>Download Genesis ERP App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#e5c158]/20 to-[#e5c158]/10 text-[#e5c158] border border-[#e5c158]/40 hover:border-[#e5c158] hover:bg-[#e5c158]/20 transition-all font-syne text-xs font-bold shadow-[0_0_10px_rgba(229,193,88,0.2)] cursor-pointer hover:scale-105 ${className}`}
          title="Download & Install Genesis ERP App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download App</span>
        </button>
      )}

      {/* PWA Install Guidance Modal mounted via React Portal to document.body */}
      {showModal && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl bg-[#14251c] border-2 border-[#e5c158]/40 p-5 sm:p-6 shadow-2xl text-[#f4f0e6] space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5c158]/20 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[#e5c158] shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-syne font-extrabold text-base text-[#f4f0e6] leading-tight">Install Genesis ERP</h3>
                  <p className="text-[11px] text-[#a3c9b0]">Fast, offline-ready desktop &amp; mobile app</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-[#a3c9b0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform-Specific Step Guide */}
            <div className="space-y-3 text-xs text-[#e8e2d3]">
              {platform === "ios" ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Smartphone className="w-4 h-4 text-[#e5c158]" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">1</span>
                      <span className="text-xs leading-snug">Tap the <strong className="text-white">Share</strong> icon <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#e5c158]" /> in Safari's bottom toolbar.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">2</span>
                      <span className="text-xs leading-snug">Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#e5c158]" />.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">3</span>
                      <span className="text-xs leading-snug">Tap <strong className="text-white">Add</strong> in the top-right corner to finish.</span>
                    </div>
                  </div>
                </>
              ) : platform === "android" ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Smartphone className="w-4 h-4 text-[#e5c158]" />
                    <span>Install on Android (Chrome)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">1</span>
                      <span className="text-xs leading-snug">Tap the <strong className="text-white">three dots menu (⋮)</strong> in Chrome.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">2</span>
                      <span className="text-xs leading-snug">Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">3</span>
                      <span className="text-xs leading-snug">Confirm by tapping <strong className="text-white">Install</strong>.</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158]">
                    <Laptop className="w-4 h-4 text-[#e5c158]" />
                    <span>Install on Desktop (Chrome, Edge, Brave)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">1</span>
                      <span className="text-xs leading-snug">Look for the <strong className="text-white">Install App icon</strong> (⊕ or ⬇) on the right side of your browser URL address bar.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">2</span>
                      <span className="text-xs leading-snug">Alternatively, click your browser menu <strong className="text-white">(⋮ or ⋯) &gt; Install Genesis ERP</strong>.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-[#e5c158]/20">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#1b3527] border border-[#e5c158]/50 flex items-center justify-center text-[10px] font-extrabold text-[#e5c158]">3</span>
                      <span className="text-xs leading-snug">Click <strong className="text-white">Install</strong> in the popup prompt.</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Direct Download Launcher File Action */}
            <div className="pt-2 border-t border-[#43634e]/30 flex flex-col gap-2">
              <button
                onClick={handleDownloadLauncher}
                className="w-full py-2.5 rounded-xl bg-[#1b3527] hover:bg-[#234533] border border-[#e5c158]/50 text-[#e5c158] font-syne font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:border-[#e5c158]"
              >
                <Download className="w-4 h-4 text-[#e5c158]" />
                <span>Download Desktop App Launcher (.html)</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#a3c9b0]">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
                <span className="truncate">Instant Launch</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
                <span className="truncate">Offline Caching</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
                <span className="truncate">Full-Screen Mode</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
                <span className="truncate">Zero Disk Footprint</span>
              </div>
            </div>

            {/* Footer Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f0d276] via-[#e5c158] to-[#c9a032] hover:brightness-110 text-[#14251c] font-syne font-extrabold text-xs transition-all shadow-lg shadow-[#e5c158]/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}


