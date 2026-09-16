"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Receipt, Wallet, PieChart, TrendingUp, TrendingDown, DollarSign, BrainCircuit, ArrowRight, ShieldCheck, FileCheck, Building2, GraduationCap } from "lucide-react";
import Link from "next/link";
import Tilt3D from "@/components/Tilt3D";

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

export default function FinanceDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        
        {/* Header & AI Insights Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight">Finance Command Center</h1>
              <p className="text-[#a3c9b0] mt-1 font-medium">Enterprise financial health, budgeting, and automated approvals.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[24px]">
                  <CornerArchOrnament position="tr" />
                  <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Total Revenue</div>
                  <div className="text-2xl font-extrabold text-[#e5c158] font-syne relative z-10">₹42.5M</div>
                  <div className="text-[11px] text-emerald-400 flex items-center mt-2 relative z-10 font-semibold"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +12% from last month</div>
                </div>
              </Tilt3D>

              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[24px]">
                  <CornerArchOrnament position="bl" />
                  <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Expenses</div>
                  <div className="text-2xl font-extrabold text-rose-400 font-syne relative z-10">₹18.2M</div>
                  <div className="text-[11px] text-rose-400 flex items-center mt-2 relative z-10 font-semibold"><TrendingDown className="w-3.5 h-3.5 mr-1" /> -3% from last month</div>
                </div>
              </Tilt3D>

              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[24px]">
                  <CornerArchOrnament position="tr" />
                  <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Pending Dues</div>
                  <div className="text-2xl font-extrabold text-amber-300 font-syne relative z-10">₹3.1M</div>
                  <div className="text-[11px] text-[#a3c9b0] mt-2 relative z-10 font-medium">From 412 Defaulters</div>
                </div>
              </Tilt3D>

              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[24px]">
                  <CornerArchOrnament position="bl" />
                  <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Available Funds</div>
                  <div className="text-2xl font-extrabold text-[#f4f0e6] font-syne relative z-10">₹24.3M</div>
                  <div className="text-[11px] text-[#a3c9b0] mt-2 relative z-10 font-medium">Across all accounts</div>
                </div>
              </Tilt3D>
            </div>
          </div>
          
          <Tilt3D className="lg:w-96 rounded-[24px]">
            <div className="glass-emerald-tile p-6 rounded-[24px] h-full relative overflow-hidden group">
              <CornerArchOrnament position="tr" />
              <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-[#e5c158]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-[#e5c158] font-syne flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-[#e5c158]" />
                  Copilot Insights
                </h3>
                <div className="space-y-3">
                  <div className="glass-box p-3.5 rounded-xl border border-rose-500/30 text-sm text-[#f4f0e6]">
                    <span className="text-rose-400 font-bold">Risk Alert:</span> Infrastructure budget is 85% utilized. Recommend freezing non-essential repairs.
                  </div>
                  <div className="glass-box p-3.5 rounded-xl border border-emerald-500/30 text-sm text-[#f4f0e6]">
                    <span className="text-emerald-400 font-bold">Forecast:</span> Expected fee collection next week is ₹4.2M based on historical payment patterns.
                  </div>
                </div>
              </div>
            </div>
          </Tilt3D>
        </div>

        {/* Core Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#f4f0e6] font-syne mb-6">Financial Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/finance/payroll" className="block">
              <Tilt3D>
                <div className="glass-emerald-tile p-6 rounded-[24px] group">
                  <CornerArchOrnament position="tr" />
                  <div className="w-12 h-12 rounded-xl bg-[#e5c158]/15 border border-[#e5c158]/30 flex items-center justify-center mb-4 text-[#e5c158] group-hover:scale-110 transition-transform relative z-10">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mb-2 relative z-10">Staff Payroll & Approvals</h3>
                  <p className="text-sm text-[#a3c9b0] mb-4 relative z-10">Review and approve monthly salaries, bonus allocations, and tax deductions.</p>
                  <div className="text-[#e5c158] text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                    View Payroll (12) <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Tilt3D>
            </Link>

            <Link href="/salary-approvals" className="block">
              <Tilt3D>
                <div className="glass-emerald-tile p-6 rounded-[24px] group">
                  <CornerArchOrnament position="bl" />
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform relative z-10">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mb-2 relative z-10">Salary Approval Matrix</h3>
                  <p className="text-sm text-[#a3c9b0] mb-4 relative z-10">Track allocated vs disbursed salary budgets for all departments and faculty.</p>
                  <div className="text-emerald-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                    Manage Salaries <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Tilt3D>
            </Link>

            <Link href="/finance/vendors" className="block">
              <Tilt3D>
                <div className="glass-emerald-tile p-6 rounded-[24px] group">
                  <CornerArchOrnament position="tr" />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-300 group-hover:scale-110 transition-transform relative z-10">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mb-2 relative z-10">Vendor & Contracts</h3>
                  <p className="text-sm text-[#a3c9b0] mb-4 relative z-10">Manage active vendor contracts, track past expenses, and process new invoices.</p>
                  <div className="text-amber-300 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                    View Vendors <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Tilt3D>
            </Link>

            <Link href="/finance/scholarships" className="block">
              <Tilt3D>
                <div className="glass-emerald-tile p-6 rounded-[24px] group">
                  <CornerArchOrnament position="bl" />
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-300 group-hover:scale-110 transition-transform relative z-10">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mb-2 relative z-10">Financial Aid & Waiver</h3>
                  <p className="text-sm text-[#a3c9b0] mb-4 relative z-10">Manage student scholarships, fee waivers, and dynamic discount rules.</p>
                  <div className="text-violet-300 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                    Manage Aid <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Tilt3D>
            </Link>

            <Link href="/finance/fee-config" className="block">
              <Tilt3D>
                <div className="glass-emerald-tile p-6 rounded-[24px] group">
                  <CornerArchOrnament position="tr" />
                  <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-4 text-sky-300 group-hover:scale-110 transition-transform relative z-10">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mb-2 relative z-10">Fee Configurator</h3>
                  <p className="text-sm text-[#a3c9b0] mb-4 relative z-10">Set master fee structures for every grade, including term, bus, and hostel fees.</p>
                  <div className="text-sky-300 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                    Configure <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Tilt3D>
            </Link>

          </div>
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

