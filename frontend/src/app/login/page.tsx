"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, ROLE_LABELS } from '@/store/authStore';
import { GraduationCap, Eye, EyeOff, LogIn, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
  };

  const quickLogins = [
    { label: 'Super Admin', email: 'superadmin@school.edu' },
    { label: 'Admin', email: 'admin@school.edu' },
    { label: 'Principal', email: 'principal@school.edu' },
    { label: 'Teacher', email: 'sarah.connor@school.edu' },
    { label: 'Student', email: 'kishor.k@school.edu' },
    { label: 'Mentor', email: 'mentor.10a@school.edu' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#090d16' }}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-2xl shadow-indigo-500/30 mb-2">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">PaperBuddy</span>
            <span className="text-gray-300"> ERP</span>
          </h1>
          <p className="text-gray-400 text-sm">AI-Powered School Operations System</p>
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Multi-Role RBAC Authentication</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel-glow rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-gray-400 text-sm">Enter your school credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@school.edu"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-700/60 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-700/60 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="pt-4 border-t border-gray-800/60 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Demo Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickLogins.map((ql) => (
                <button
                  key={ql.email}
                  type="button"
                  onClick={() => {
                    setEmail(ql.email);
                    setPassword('school@123');
                  }}
                  className="px-2 py-2 rounded-lg bg-gray-800/60 border border-gray-700/40 text-xs text-gray-300 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-600/10 transition-all text-center"
                >
                  {ql.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 text-center">
              Default password: <code className="text-indigo-400">school@123</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 space-y-1">
          <p>PaperBuddy ERP v2.0 — AI-Core with 8-Role RBAC</p>
          <p>LKG to 12th Standard • Multi-Department Management</p>
        </div>
      </div>
    </div>
  );
}
