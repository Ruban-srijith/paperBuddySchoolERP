"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Receipt, Wallet, PieChart, TrendingUp, TrendingDown, DollarSign, BrainCircuit, ArrowRight, ShieldCheck, FileCheck, Building2, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function FinanceDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* Header & AI Insights Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Finance Command Center</h1>
            <p className="text-gray-400 mt-2">Enterprise financial health, budgeting, and automated approvals.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="glass-panel p-4 rounded-2xl border border-gray-800">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-emerald-400">₹42.5M</div>
                <div className="text-[10px] text-emerald-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +12% from last month</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-gray-800">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Expenses</div>
                <div className="text-2xl font-bold text-rose-400">₹18.2M</div>
                <div className="text-[10px] text-rose-500 flex items-center mt-1"><TrendingDown className="w-3 h-3 mr-1" /> -3% from last month</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-gray-800">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Pending Dues</div>
                <div className="text-2xl font-bold text-amber-400">₹3.1M</div>
                <div className="text-[10px] text-gray-500 mt-1">From 412 Defaulters</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-gray-800">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Available Funds</div>
                <div className="text-2xl font-bold text-white">₹24.3M</div>
                <div className="text-[10px] text-gray-500 mt-1">Across all accounts</div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-80 glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-900/20 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit className="w-24 h-24 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5" />
                Copilot Insights
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800/50 text-sm">
                  <span className="text-rose-400 font-semibold">Risk Alert:</span> The Infrastructure budget is 85% utilized. Recommend freezing non-essential repairs.
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800/50 text-sm">
                  <span className="text-emerald-400 font-semibold">Forecast:</span> Expected fee collection next week is ₹4.2M based on historical payment patterns.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Modules Grid */}
        <h2 className="text-xl font-bold text-white mt-12 mb-6">Financial Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/finance/approvals" className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Approval Center</h3>
            <p className="text-sm text-gray-400 mb-4">Review and approve budget requests from Teachers, Wardens, and Principals.</p>
            <div className="text-indigo-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
              View Pending (12) <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/finance/budgets" className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Department Budgets</h3>
            <p className="text-sm text-gray-400 mb-4">Track allocated vs utilized funds for Academics, Events, and Infrastructure.</p>
            <div className="text-emerald-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
              Manage Budgets <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/finance/vendors" className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vendor & Contracts</h3>
            <p className="text-sm text-gray-400 mb-4">Manage active vendor contracts, track past expenses, and process new invoices.</p>
            <div className="text-amber-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
              View Vendors <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/finance/scholarships" className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Financial Aid</h3>
            <p className="text-sm text-gray-400 mb-4">Manage student scholarships, fee waivers, and dynamic discount rules.</p>
            <div className="text-violet-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
              Manage Aid <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/finance/fee-config" className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fee Configurator</h3>
            <p className="text-sm text-gray-400 mb-4">Set master fee structures for every grade, including term, bus, and hostel fees.</p>
            <div className="text-blue-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
              Configure <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

        </div>
      </div>
    </ProtectedRoute>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
