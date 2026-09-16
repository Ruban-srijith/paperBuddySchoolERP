"use client";

import { Shield, Flame } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#14251c] text-[#f4f0e6]">
      {/* Background Architectural Grid Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#e8e2d3_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* Loading Container */}
      <div className="relative flex flex-col items-center justify-center z-10">
        
        {/* Emblem Badge Container */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-5">
          
          {/* Ambient Radial Glow */}
          <div className="absolute inset-0 rounded-full bg-[#43634e]/40 blur-xl animate-pulse" />

          {/* Emblem Container with CSS pulse-scale */}
          <div className="w-20 h-20 rounded-2xl bg-[#1b3527] border border-[#f4f0e6]/40 shadow-2xl flex items-center justify-center relative backdrop-blur-md animate-fade-in">
            {/* Front Shield & Torch emblem */}
            <div className="flex items-center justify-center text-[#e8e2d3]">
              <Shield className="w-10 h-10 stroke-[1.5]" />
              <Flame className="w-4.5 h-4.5 absolute text-[#f4f0e6] fill-[#e8e2d3] animate-pulse" />
            </div>

            {/* Subtle Glass Light Reflection */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
          </div>

          {/* Floor Shadow */}
          <div className="absolute -bottom-3 w-14 h-2.5 rounded-full bg-black/40 blur-sm" />
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1 animate-fade-in">
          <h2 className="text-lg font-extrabold text-[#f4f0e6] tracking-tight font-syne">
            Genesis ERP
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#b5ad9b] font-medium">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#e5c158]/30 border-t-[#e5c158] animate-spin" />
            <span>Loading Workspace...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
