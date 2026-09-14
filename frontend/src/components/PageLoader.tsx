"use client";

import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F9FD] dark:bg-[#0b0f19] transition-colors duration-300">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Animated ambient glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        
        {/* Outer spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-blue border-r-indigo-500 animate-spin" />
        
        {/* Inner logo icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.05, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-lg p-2"
        >
          <img src="/logo.png" alt="Genesis ERP" className="w-full h-full object-contain" />
        </motion.div>
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 text-xl font-bold text-brand-blue tracking-tight dark:text-blue-400"
      >
        Genesis ERP
      </motion.h2>
      <p className="mt-1 text-xs text-gray-400 font-medium animate-pulse">Loading Workspace...</p>
    </div>
  );
}
