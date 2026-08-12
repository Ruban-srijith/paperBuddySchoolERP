"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { 
  ArrowRight, Sparkles, BrainCircuit, ShieldCheck, 
  LayoutDashboard, Users, GraduationCap, BarChart3, Clock, 
  Zap, Globe, ChevronRight, CheckCircle2, Star,
  Quote
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 100, damping: 20 } }
};

function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3);
    y.set(middleY * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Hide preloader after 2.5 seconds
    const timer = setTimeout(() => setShowPreloader(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] text-brand-black overflow-x-hidden selection:bg-brand-blue/20 font-sans">
      
      {/* Lottie Preloader */}
      {showPreloader && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
          <div className="w-64 h-64 md:w-96 md:h-96">
            <DotLottieReact
              src="https://lottie.host/057444ae-9ed4-4565-9c62-0342d6851089/8qWSdLzTv5.lottie"
              loop
              autoplay
            />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xl font-bold text-brand-blue tracking-tight"
          >
            PaperBuddy
          </motion.h2>
        </div>
      )}

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden group"
            >
              <img src="/logo.png" alt="PaperBuddy Logo" className="w-full h-full object-contain relative z-10" />
            </motion.div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-brand-blue whitespace-nowrap">
              PaperBuddy
            </span>
          </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
          <a href="#features" className="hover:text-brand-blue transition-colors">Features</a>
          <a href="#impact" className="hover:text-brand-blue transition-colors">Impact</a>
          <a href="#testimonials" className="hover:text-brand-blue transition-colors">Testimonials</a>
          <a href="#platform" className="hover:text-brand-blue transition-colors">Platform</a>
        </div>

          <div className="shrink-0 flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="group relative inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-brand-black hover:bg-gray-100 transition-all whitespace-nowrap overflow-hidden">
                <span className="relative z-10">Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link href="/login" className="group relative inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-brand-blue text-white text-xs sm:text-sm font-bold hover:bg-brand-blue/90 shadow-md transition-all whitespace-nowrap">
                <span className="relative z-10">Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="pt-24 pb-32 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 overflow-visible">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-sm font-bold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>v2.0 Next-Gen AI Release</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariant} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-brand-black hyphens-auto break-words">
              Autonomous School <br />
              <span className="text-brand-blue">
                Operations Platform
              </span>
            </motion.h1>

            <motion.p variants={fadeUpVariant} className="mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              PaperBuddy transforms traditional school management with a 9-Role RBAC system, automated workflows, and intelligent analytics from LKG to 12th Standard.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <MagneticButton>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/dashboard" className="px-8 py-4 rounded-full bg-brand-blue text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      Enter Workspace
                    </Link>
                  </motion.div>
                </MagneticButton>
              ) : (
                <MagneticButton>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="px-8 py-4 rounded-full bg-brand-blue text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3">
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </MagneticButton>
              )}
              <MagneticButton>
                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#features" className="group px-8 py-4 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-bold text-lg text-brand-black transition-colors flex items-center gap-2 shadow-sm">
                  Explore Features
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                </motion.a>
              </MagneticButton>
            </motion.div>
            
            <motion.div variants={fadeUpVariant} className="mt-12 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day free trial
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl relative"
          >
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [3, 2, 3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-brand-blue/5 rounded-[40px] blur-3xl"
            ></motion.div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[32px] overflow-hidden border border-gray-200 shadow-2xl bg-white p-4"
            >
              <img src="/dashboard-mockup.png" alt="PaperBuddy Dashboard" className="w-full h-auto object-cover rounded-[20px] bg-gray-50" />
            </motion.div>
            
            {/* Floating badges */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-6 -left-6 bg-white border border-gray-100 p-4 rounded-[24px] shadow-lg flex items-center gap-4"
            >
              <div className="bg-emerald-50 p-2 rounded-[12px]">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Security</div>
                <div className="text-sm text-brand-black font-extrabold">Enterprise Grade</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-6 bg-white border border-gray-100 p-4 rounded-[24px] shadow-lg flex items-center gap-4"
            >
              <div className="bg-brand-blue/10 p-2 rounded-[12px]">
                <BrainCircuit className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">AI Processing</div>
                <div className="text-sm text-brand-black font-extrabold">Live 24/7</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Impact/Statistics Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          id="impact" 
          className="py-20 border-y border-gray-200 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            <motion.div variants={fadeUpVariant} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-brand-black mb-2 tracking-tight">50<span className="text-brand-blue">+</span></div>
              <div className="text-gray-400 font-bold uppercase tracking-wider text-xs md:text-sm">Partner Schools</div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-brand-black mb-2 tracking-tight">1.2<span className="text-brand-blue">M</span></div>
              <div className="text-gray-400 font-bold uppercase tracking-wider text-xs md:text-sm">Students Managed</div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-brand-black mb-2 tracking-tight">99.9<span className="text-brand-blue">%</span></div>
              <div className="text-gray-400 font-bold uppercase tracking-wider text-xs md:text-sm">System Uptime</div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-brand-black mb-2 tracking-tight">10<span className="text-brand-blue">x</span></div>
              <div className="text-gray-400 font-bold uppercase tracking-wider text-xs md:text-sm">Faster Grading</div>
            </motion.div>
          </div>
        </motion.section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-32 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-6">Everything you need, <br/><span className="text-brand-blue">beautifully integrated.</span></h2>
            <p className="text-gray-500 font-medium text-lg">Stop juggling dozens of disjointed tools. PaperBuddy provides a unified, AI-driven ecosystem tailored perfectly for modern educational institutions.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[320px]">
            {/* Bento Box 1: AI */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="md:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-[16px] bg-brand-blue/10 flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-brand-black mb-3">Intelligent Grading & OCR</h3>
                <p className="text-gray-500 font-medium text-lg max-w-md leading-relaxed">
                  Upload photos of subjective exam papers and let our proprietary AI models grade them instantly. Save thousands of teacher hours every semester.
                </p>
              </div>
              <div className="relative z-10 self-end opacity-50 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-6 h-6 text-brand-blue" />
              </div>
            </motion.div>

            {/* Bento Box 2: RBAC */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="md:col-span-1 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer"
            >
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-50 rounded-full blur-3xl transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-[16px] bg-cyan-50 flex items-center justify-center mb-6 text-cyan-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-black mb-3">9-Role Secure RBAC</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  From Super Admin to Student, everyone gets a highly tailored dashboard with strictly enforced security scopes.
                </p>
              </div>
            </motion.div>

            {/* Bento Box 3: Ecosystem */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="md:col-span-1 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer"
            >
               <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-[16px] bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-black mb-3">Unified Platform</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Hostel, Library, Finance, Academics, and Transport—all connected in a single truth matrix.
                </p>
              </div>
            </motion.div>

            {/* Bento Box 4: Analytics */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
              className="md:col-span-2 bg-brand-black p-8 rounded-[32px] relative overflow-hidden group flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-blue/20 transition-all cursor-pointer"
            >
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-[16px] bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Predictive Analytics</h3>
                  <p className="text-gray-400 font-medium text-lg leading-relaxed">
                    Identify struggling students before they fail. Our models analyze attendance, past scores, and behavior to flag interventions.
                  </p>
                </div>
                
                {/* Mock Chart UI */}
                <div className="hidden md:flex flex-1 w-full h-full bg-white/5 rounded-[24px] p-4 flex-col justify-end gap-2 relative overflow-hidden group-hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-end h-full gap-2 px-2">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                        viewport={{ once: true }}
                        key={i} 
                        className="w-full bg-brand-blue rounded-t-[4px]" 
                      ></motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platform Modules Section */}
        <section id="platform" className="py-32 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-6">A Complete <span className="text-brand-blue">Platform</span></h2>
            <p className="text-gray-500 font-medium text-lg">Every module you need to run your institution, seamlessly talking to each other in real-time.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {['Academics', 'Finance & Fees', 'HR & Payroll', 'Library', 'Transport'].map((module, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 whileHover={{ y: -5 }}
                 className="bg-white border border-gray-200 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
               >
                 <div className="w-12 h-12 bg-brand-blue/5 group-hover:bg-brand-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue" />
                 </div>
                 <h4 className="font-bold text-brand-black text-sm">{module}</h4>
               </motion.div>
             ))}
          </div>
        </section>
        {/* New Testimonials Section */}
        <section id="testimonials" className="py-32 px-4 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-6">Trusted by the best.</h2>
              <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Hear from principals, teachers, and admins who have transformed their daily operations.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Dr. Sarah Connor", role: "Principal, Lincoln High", text: "PaperBuddy completely revolutionized how we handle our grading and timetable scheduling. It's like having an extra admin team." },
                { name: "James Wilson", role: "Head of Academics", text: "The AI predictive analytics caught 15 students who were silently struggling. We intervened early and saved their semester." },
                { name: "Elena Rodriguez", role: "Finance Director", text: "Fee collection tracking used to take a week. Now I get a real-time snapshot on my dashboard every morning. Absolutely brilliant." }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <Quote className="w-8 h-8 text-brand-blue/20 mb-6" />
                  <p className="text-gray-600 font-medium mb-8 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-brand-black">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Sleek Footer */}
      <footer className="relative z-10 bg-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="PaperBuddy Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-xl text-brand-black">PaperBuddy</span>
            </div>
            <p className="text-gray-500 font-medium max-w-sm mb-6 leading-relaxed">
              The world's most advanced autonomous school operations platform, designed to eliminate administrative friction.
            </p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer text-gray-500 hover:text-brand-blue hover:border-brand-blue/30 transition-colors"><Globe className="w-4 h-4" /></motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer text-gray-500 hover:text-brand-blue hover:border-brand-blue/30 transition-colors"><Zap className="w-4 h-4" /></motion.div>
            </div>
          </div>
          
          <div>
            <h4 className="font-extrabold text-brand-black mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4 font-semibold">
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Security</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-extrabold text-brand-black mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 font-semibold">
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-blue transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 font-semibold">
          <p className="text-gray-400 text-sm">© 2026 PaperBuddy. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-brand-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-black transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
