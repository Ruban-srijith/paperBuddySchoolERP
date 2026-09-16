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

      {/* ─── 2. ARCHITECTURAL DOT MATRIX & ROYAL GOLD LATTICE GRID MASK ────── */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(#e5c158 1.4px, transparent 1.4px), radial-gradient(#e8e2d3 1px, transparent 1px)`,
          backgroundSize: '36px 36px, 18px 18px',
          backgroundPosition: '0 0, 9px 9px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.2) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* ─── 3. ROYAL GOLD HERALDRY CREST & ARCHITECTURAL LINE ART (TOP CENTER) ─── */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[800px] h-48 opacity-25 text-[#e5c158] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 200" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Royal Heraldic Crest Arc */}
          <path d="M 200 40 Q 400 120 600 40" strokeDasharray="4 4" />
          <path d="M 150 20 Q 400 160 650 20" strokeWidth="1.5" />
          <path d="M 300 0 C 350 40 450 40 500 0" strokeDasharray="3 3" />
          
          {/* Royal Crown Emblem Center Anchor */}
          <g transform="translate(370, 15)">
            <path d="M 10 30 L 20 10 L 30 25 L 40 10 L 50 30 Z" fill="none" stroke="#e5c158" strokeWidth="1.5" />
            <circle cx="20" cy="8" r="3" fill="#e5c158" />
            <circle cx="40" cy="8" r="3" fill="#e5c158" />
            <circle cx="30" cy="22" r="2.5" fill="#e5c158" />
          </g>

          <line x1="50" y1="30" x2="750" y2="30" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* ─── 4. CORNER CONCENTRIC ARCH & ROYAL FILIGREE ORNAMENTS (ALL 4 CORNERS) ─── */}
      {/* Top-Left Corner Arch & Royal Filigree */}
      <svg className="absolute top-0 left-0 w-96 h-96 opacity-45 text-[#e5c158]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="0" cy="0" r="280" strokeDasharray="6 6" />
        <circle cx="0" cy="0" r="240" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="200" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="160" />
        <circle cx="0" cy="0" r="120" strokeDasharray="2 2" />
        <circle cx="0" cy="0" r="80" />
        <line x1="0" y1="0" x2="300" y2="300" strokeDasharray="4 4" />
        {/* Royal Corner Flourish */}
        <path d="M 30 180 C 80 180 180 80 180 30" strokeWidth="1.5" />
        <path d="M 50 220 C 120 220 220 120 220 50" strokeDasharray="2 2" />
        <text x="210" y="30" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.8">ROYAL-TL // 01</text>
      </svg>

      {/* Top-Right Corner Arch & Royal Filigree */}
      <svg className="absolute top-0 right-0 w-96 h-96 opacity-45 text-[#e5c158]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="300" cy="0" r="280" strokeDasharray="6 6" />
        <circle cx="300" cy="0" r="240" strokeWidth="1.5" />
        <circle cx="300" cy="0" r="200" strokeDasharray="3 3" />
        <circle cx="300" cy="0" r="160" />
        <circle cx="300" cy="0" r="120" strokeDasharray="2 2" />
        <circle cx="300" cy="0" r="80" />
        <line x1="300" y1="0" x2="0" y2="300" strokeDasharray="4 4" />
        {/* Royal Corner Flourish */}
        <path d="M 270 180 C 220 180 120 80 120 30" strokeWidth="1.5" />
        <path d="M 250 220 C 180 220 80 120 80 50" strokeDasharray="2 2" />
        <text x="40" y="30" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.8">ROYAL-TR // 02</text>
      </svg>

      {/* Bottom-Left Corner Arch & Royal Filigree */}
      <svg className="absolute bottom-0 left-0 w-96 h-96 opacity-45 text-[#e5c158]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="0" cy="300" r="280" strokeDasharray="6 6" />
        <circle cx="0" cy="300" r="240" strokeWidth="1.5" />
        <circle cx="0" cy="300" r="200" strokeDasharray="3 3" />
        <circle cx="0" cy="300" r="160" />
        <circle cx="0" cy="300" r="120" strokeDasharray="2 2" />
        <circle cx="0" cy="300" r="80" />
        <line x1="0" y1="300" x2="300" y2="0" strokeDasharray="4 4" />
        <text x="210" y="280" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.8">ROYAL-BL // 03</text>
      </svg>

      {/* Bottom-Right Corner Arch & Royal Filigree */}
      <svg className="absolute bottom-0 right-0 w-96 h-96 opacity-45 text-[#e5c158]" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="300" cy="300" r="280" strokeDasharray="6 6" />
        <circle cx="300" cy="300" r="240" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="200" strokeDasharray="3 3" />
        <circle cx="300" cy="300" r="160" />
        <circle cx="300" cy="300" r="120" strokeDasharray="2 2" />
        <circle cx="300" cy="300" r="80" />
        <line x1="300" y1="300" x2="0" y2="0" strokeDasharray="4 4" />
        <text x="40" y="280" fill="currentColor" opacity="0.8" fontSize="8" fontFamily="monospace">ROYAL-BR // 04</text>
      </svg>

      {/* ─── 5. CENTRAL RADIAL COMPASS & ROYAL SHIELD WATERMARK ────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-15 text-[#e5c158] hidden lg:block pointer-events-none">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 600 600" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="300" cy="300" r="290" strokeDasharray="8 8" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="250" />
          <circle cx="300" cy="300" r="210" strokeDasharray="4 4" />
          <polygon points="300,50 310,290 300,300 290,290" fill="currentColor" opacity="0.4" />
          <polygon points="300,550 310,310 300,300 290,310" fill="currentColor" opacity="0.4" />
          <polygon points="550,300 310,310 300,300 310,290" fill="currentColor" opacity="0.4" />
          <polygon points="50,300 290,310 300,300 290,290" fill="currentColor" opacity="0.4" />
          <circle cx="300" cy="300" r="120" strokeDasharray="2 2" />
        </svg>
      </div>
    </div>
  );
}

