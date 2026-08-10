"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, ChevronRight, ArrowLeft, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring" as any, 
      stiffness: 100, 
      damping: 20,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 100 } }
};

export default function RegisterSchoolPage() {
  const router = useRouter();
  
  // School details
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Admin details
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Register School
      await api.post('/schools/register', {
        school: {
          name: schoolName,
          address,
          contact_email: contactEmail,
        },
        admin_user: {
          email: adminEmail,
          full_name: adminFullName,
          password: adminPassword,
          role: 'admin',
        }
      });
      
      // 2. Login automatically
      const success = await login(adminEmail, adminPassword);
      if (success) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      } else {
        setError('School registered, but automatic login failed. Please sign in manually.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register school. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4 font-sans overflow-hidden py-12">
      
      {/* Background Animated Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-brand-blue/5 blur-3xl"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col pt-12 pb-8 px-8 min-h-[750px] border border-white z-10"
      >
        
        {/* Back Button */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-8">
          {/* Logo & Branding */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 space-y-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-20 h-20 flex items-center justify-center bg-brand-blue/10 rounded-3xl"
            >
              <Building2 className="w-10 h-10 text-brand-blue" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight">
                Register Your School
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Join PaperBuddy to modernize your operations
              </p>
            </div>
          </motion.div>

          <motion.form 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit} 
            className="space-y-6 w-full"
          >
            {/* School Details Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">School Information</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="E.g., Springfield High School"
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border border-transparent focus:ring-brand-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  School Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full physical address"
                  className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border border-transparent focus:ring-brand-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@school.edu"
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border border-transparent focus:ring-brand-blue/50"
                />
              </div>
            </motion.div>

            {/* Admin Details Section */}
            <motion.div variants={itemVariants} className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Admin Account</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border border-transparent focus:ring-brand-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  Admin Email (Login ID)
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border border-transparent focus:ring-brand-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:ring-2 border pr-12 border-transparent focus:ring-brand-blue/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-14 rounded-full bg-brand-black text-white font-bold text-base shadow-lg shadow-black/20 hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center mt-8 overflow-hidden"
              >
                <div className="absolute left-1.5 w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                  {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                     <ChevronRight className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="flex-1 text-center pr-8">
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </span>
                {!isLoading && (
                  <div className="absolute right-5 flex items-center space-x-[-8px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

        </div>
      </motion.div>
    </div>
  );
}
