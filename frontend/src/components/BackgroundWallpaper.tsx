"use client";

import React from "react";
import { Shield, Flame, Sparkles, GraduationCap, Award, Activity, Lock, BookOpen, Layers } from "lucide-react";

export default function BackgroundWallpaper() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" style={{ contain: 'strict' }}>
      {/* ─── 1. ATMOSPHERIC VOLUMETRIC GLOW (Hardware-friendly radial gradients) ─────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,80,58,0.25)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(27,53,39,0.35)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(67,99,78,0.15)_0%,transparent_70%)] pointer-events-none hidden md:block" />
      <div className="absolute bottom-[25%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(232,226,211,0.05)_0%,transparent_70%)] pointer-events-none hidden md:block" />

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-15 text-[#e8e2d3] hidden lg:block pointer-events-none">
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
    </div>
  );
}

