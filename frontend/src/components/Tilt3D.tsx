"use client";

import React, { useRef, ReactNode } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

export default function Tilt3D({ 
  children, 
  className = "", 
  maxTilt = 8, 
  scale = 1.025 
}: Tilt3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    cardRef.current.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current || !glareRef.current) return;
      
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px) scale3d(${scale}, ${scale}, ${scale})`;
      
      const glX = (x / rect.width) * 100;
      const glY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${glX}% ${glY}%, rgba(255, 255, 255, 0.18), transparent 60%)`;
      glareRef.current.style.opacity = "1";
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!cardRef.current || !glareRef.current) return;
    
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)";
    glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d",
        transition: "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* 3D Cursor Glare Overlay */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30"
        style={{ opacity: 0 }}
      />
      {children}
    </div>
  );
}
