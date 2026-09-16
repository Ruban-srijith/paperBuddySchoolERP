"use client";

import React from "react";
import { Shield, Flame, Sparkles, GraduationCap, Award, Activity, Lock, BookOpen, Layers } from "lucide-react";

export default function BackgroundWallpaper() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ─── 1. ATMOSPHERIC VOLUMETRIC GLOW ORBS ─────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#2d503a]/30 blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#1b3527]/50 blur-[150px]" />
      <div className="absolute top-[35%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-[#43634e]/20 blur-[120px]" />
      <div className="absolute bottom-[25%] left-[5%] w-[35vw] h-[35vw] rounded-full bg-[#e8e2d3]/5 blur-[100px]" />

      {/* ─── 2. ARCHITECTURAL DOT MATRIX GRID MASK ─────────────────────── */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `radial-gradient(#e8e2d3 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.3) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* ─── 3. TOP & BOTTOM GEOMETRIC SINE-WAVE GRAPHIC LINES ───────────── */}
      <svg className="absolute top-0 left-0 w-full h-40 opacity-20 text-[#e8e2d3]" viewBox="0 0 1440 160" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M 0 40 Q 360 120 720 40 T 1440 40" strokeDasharray="4 4" />
        <path d="M 0 80 Q 360 160 720 80 T 1440 80" />
        <line x1="0" y1="20" x2="1440" y2="20" strokeDasharray="6 6" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full h-40 opacity-20 text-[#e8e2d3]" viewBox="0 0 1440 160" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M 0 120 Q 360 40 720 120 T 1440 120" strokeDasharray="4 4" />
        <path d="M 0 80 Q 360 0 720 80 T 1440 80" />
        <line x1="0" y1="140" x2="1440" y2="140" strokeDasharray="6 6" />
      </svg>

      {/* ─── 4. CORNER CONCENTRIC ARCH ORNAMENTS (ALL 4 CORNERS) ─────────── */}
      {/* Top-Left Corner Arch */}
      <svg className="absolute top-0 left-0 w-96 h-96 opacity-40 text-[#e8e2d3]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="0" cy="0" r="280" strokeDasharray="6 6" />
        <circle cx="0" cy="0" r="240" />
        <circle cx="0" cy="0" r="200" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="160" />
        <circle cx="0" cy="0" r="120" strokeDasharray="2 2" />
        <circle cx="0" cy="0" r="80" />
        <line x1="0" y1="0" x2="300" y2="300" strokeDasharray="4 4" />
        <text x="210" y="30" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.7">ARCH-TL // 01</text>
      </svg>

      {/* Top-Right Corner Arch */}
      <svg className="absolute top-0 right-0 w-96 h-96 opacity-40 text-[#e8e2d3]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="300" cy="0" r="280" strokeDasharray="6 6" />
        <circle cx="300" cy="0" r="240" />
        <circle cx="300" cy="0" r="200" strokeDasharray="3 3" />
        <circle cx="300" cy="0" r="160" />
        <circle cx="300" cy="0" r="120" strokeDasharray="2 2" />
        <circle cx="300" cy="0" r="80" />
        <line x1="300" y1="0" x2="0" y2="300" strokeDasharray="4 4" />
        <text x="40" y="30" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.7">ARCH-TR // 02</text>
      </svg>

      {/* Bottom-Left Corner Arch */}
      <svg className="absolute bottom-0 left-0 w-96 h-96 opacity-40 text-[#e8e2d3]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="0" cy="300" r="280" strokeDasharray="6 6" />
        <circle cx="0" cy="300" r="240" />
        <circle cx="0" cy="300" r="200" strokeDasharray="3 3" />
        <circle cx="0" cy="300" r="160" />
        <circle cx="0" cy="300" r="120" strokeDasharray="2 2" />
        <circle cx="0" cy="300" r="80" />
        <line x1="0" y1="300" x2="300" y2="0" strokeDasharray="4 4" />
        <text x="210" y="280" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.7">ARCH-BL // 03</text>
      </svg>

      {/* Bottom-Right Corner Arch */}
      <svg className="absolute bottom-0 right-0 w-96 h-96 opacity-40 text-[#e8e2d3]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="300" cy="300" r="280" strokeDasharray="6 6" />
        <circle cx="300" cy="300" r="240" />
        <circle cx="300" cy="300" r="200" strokeDasharray="3 3" />
        <circle cx="300" cy="300" r="160" />
        <circle cx="300" cy="300" r="120" strokeDasharray="2 2" />
        <circle cx="300" cy="300" r="80" />
        <line x1="300" y1="300" x2="0" y2="0" strokeDasharray="4 4" />
        <text x="40" y="280" fill="currentColor" opacity="0.7" fontSize="8" fontFamily="monospace">ARCH-BR // 04</text>
      </svg>

      {/* ─── 5. CENTRAL RADIAL COMPASS WATERMARK (BEHIND MAIN CONTENT) ────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-15 text-[#e8e2d3]">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 600 600" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="300" cy="300" r="290" strokeDasharray="8 8" />
          <circle cx="300" cy="300" r="250" />
          <circle cx="300" cy="300" r="210" strokeDasharray="4 4" />
          <polygon points="300,50 310,290 300,300 290,290" fill="currentColor" opacity="0.3" />
          <polygon points="300,550 310,310 300,300 290,310" fill="currentColor" opacity="0.3" />
          <polygon points="550,300 310,310 300,300 310,290" fill="currentColor" opacity="0.3" />
          <polygon points="50,300 290,310 300,300 290,290" fill="currentColor" opacity="0.3" />
          <circle cx="300" cy="300" r="120" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* ─── 6. FLOATING OPTICAL MIRROR GLASSMORPHISM CARDS (BACKGROUND MIRROR MORPHISM) ─── */}
      {/* Top-Left: Active Students */}
      <div className="absolute top-[12%] left-[4%] hidden xl:block z-0 pointer-events-none anti-gravity-1">
        <div className="glass-emerald-tile p-4 rounded-[20px] w-64 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#182e22] border border-[#e8e2d3]/30 flex items-center justify-center text-[#e8e2d3] shadow-md">
              <GraduationCap className="w-5 h-5 text-[#e8e2d3]" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#f4f0e6] tracking-tight font-syne">2,450+ <span className="text-[10px] font-normal text-[#a3c9b0]">Active</span></div>
              <div className="text-[11px] font-bold text-[#a3c9b0]">Active Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mid-Left: AI OCR Evaluation */}
      <div className="absolute top-[38%] left-[2%] hidden xl:block z-0 pointer-events-none anti-gravity-2">
        <div className="glass-emerald-tile p-5 rounded-[22px] w-72 shadow-2xl backdrop-blur-2xl border border-white/40 space-y-2">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-extrabold text-[#a3c9b0] uppercase tracking-widest font-mono">AI EVALUATION</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-sm font-extrabold text-[#f4f0e6] font-syne relative z-10">Autonomous OCR Grading</div>
          <p className="text-[11px] text-[#a3c9b0] font-medium leading-relaxed relative z-10">
            Real-time marks dispatch & analytics
          </p>
        </div>
      </div>

      {/* Bottom-Left: Encryption & Security */}
      <div className="absolute bottom-[15%] left-[4%] hidden xl:block z-0 pointer-events-none anti-gravity-3">
        <div className="glass-emerald-tile p-4 rounded-[20px] w-64 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="text-[10px] font-mono text-[#a3c9b0] mb-1 font-bold relative z-10">SEC // TLS-256</div>
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#182e22] border border-[#e8e2d3]/30 flex items-center justify-center text-[#e8e2d3]">
              <Lock className="w-4 h-4 text-[#e8e2d3]" />
            </div>
            <span className="text-xs font-extrabold text-[#f4f0e6] font-syne">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Top-Right: Genesis ERP Version Badge */}
      <div className="absolute top-[12%] right-[4%] hidden xl:block z-0 pointer-events-none anti-gravity-4">
        <div className="glass-emerald-tile p-4 rounded-[20px] w-60 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-extrabold text-[#f4f0e6] font-syne">Genesis ERP</span>
            <span className="text-[10px] font-mono text-[#a3c9b0] font-bold">v2.0</span>
          </div>
        </div>
      </div>

      {/* Mid-Right: Live Attendance Indicator */}
      <div className="absolute top-[38%] right-[2%] hidden xl:block z-0 pointer-events-none anti-gravity-1">
        <div className="glass-emerald-tile p-5 rounded-[22px] w-72 shadow-2xl backdrop-blur-2xl border border-white/40 space-y-2">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-extrabold text-[#a3c9b0] uppercase tracking-widest font-mono">ATTENDANCE LIVE</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#f4f0e6] font-syne relative z-10">98.4%</div>
          <div className="w-full h-1.5 rounded-full bg-[#12281b] overflow-hidden border border-[#a3c9b0]/20 relative z-10">
            <div className="h-full bg-emerald-400 rounded-full w-[98.4%]" />
          </div>
        </div>
      </div>

      {/* Bottom-Right: Campus Location Badge */}
      <div className="absolute bottom-[15%] right-[4%] hidden xl:block z-0 pointer-events-none anti-gravity-2">
        <div className="glass-emerald-tile p-4 rounded-[20px] w-64 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="text-[10px] font-mono text-[#a3c9b0] mb-1 font-bold relative z-10">LOC // SEC-01</div>
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#182e22] border border-[#e8e2d3]/30 flex items-center justify-center text-[#e8e2d3]">
              <Shield className="w-4 h-4 text-[#e8e2d3]" />
            </div>
            <span className="text-xs font-extrabold text-[#f4f0e6] font-syne">Bharathi Hr. Sec.</span>
          </div>
        </div>
      </div>

      {/* ─── 7. FLOATING AMBIENT DUST PARTICLES ──────────────────────────── */}
      <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-[#e8e2d3]/40 blur-[1px] animate-pulse" />
      <div className="absolute top-[45%] left-[12%] w-1.5 h-1.5 rounded-full bg-emerald-300/30 blur-[1px] animate-ping" />
      <div className="absolute bottom-[30%] left-[25%] w-2 h-2 rounded-full bg-[#e8e2d3]/30 blur-[1px] animate-pulse" />
      <div className="absolute top-[25%] right-[18%] w-1.5 h-1.5 rounded-full bg-amber-200/40 blur-[1px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[15%] w-2 h-2 rounded-full bg-emerald-400/30 blur-[1px] animate-pulse" />
    </div>
  );
}

