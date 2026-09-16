"use client";

import { motion } from 'framer-motion';
import { Shield, Flame } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#14251c] text-[#f4f0e6] transition-colors duration-200">
      {/* Background Architectural Grid Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#e8e2d3_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* 3D Perspective Loading Container */}
      <div className="relative flex flex-col items-center justify-center z-10">
        
        {/* 3D Rotating Shield Emblem Badge */}
        <div className="relative w-24 h-24 flex items-center justify-center perspective-[800px] mb-6">
          
          {/* Ambient 3D Radial Glow */}
          <div className="absolute inset-0 rounded-full bg-[#43634e]/40 blur-2xl animate-pulse" />

          {/* Rotating 3D Emblem Container */}
          <motion.div
            animate={{ 
              rotateY: [0, 180, 360],
              rotateX: [0, 15, 0, -15, 0],
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-20 h-20 rounded-2xl bg-[#1b3527] border border-[#f4f0e6]/40 shadow-2xl flex items-center justify-center relative backdrop-blur-md"
          >
            {/* Front 3D Shield & Torch emblem */}
            <div 
              style={{ transform: 'translateZ(12px)' }} 
              className="flex items-center justify-center text-[#e8e2d3]"
            >
              <Shield className="w-10 h-10 stroke-[1.5]" />
              <Flame className="w-4.5 h-4.5 absolute text-[#f4f0e6] fill-[#e8e2d3]" />
            </div>

            {/* Subtle 3D Glass Light Reflection */}
            <div 
              style={{ transform: 'translateZ(18px)' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" 
            />
          </motion.div>

          {/* 3D Floor Shadow */}
          <div className="absolute -bottom-4 w-16 h-3 rounded-full bg-black/50 blur-md animate-shadow-3d" />
        </div>

        {/* Brand Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-1"
        >
          <h2 className="text-xl font-extrabold text-[#f4f0e6] tracking-tight font-syne">
            Genesis ERP
          </h2>
          <p className="text-xs text-[#b5ad9b] font-semibold tracking-wide">
            Loading Campus Workspace...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
