"use client";

import { useEffect, useState, Suspense } from 'react';
import { 
  Building2, Users, School as SchoolIcon, Activity, 
  ArrowRight, ShieldCheck, DollarSign, Sparkles, 
  History, CreditCard, Plus, Check, X, ShieldAlert,
  ChevronRight, RefreshCw, KeyRound, AlertTriangle, Megaphone
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { useSearchParams, useRouter } from 'next/navigation';

interface SchoolData {
  id: string;
  name: string;
  code: string;
  address: string;
  contact_email: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  joined?: string;
}

interface AdminData {
  id: string;
  name: string;
  username: string;
  college: string;
  status: 'Changed' | 'Pending Change';
  created: string;
}

interface AuditLog {
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  tenant: string;
}

interface PaymentRecord {
  college: string;
  mode: string;
  platform: number;
  own: number;
  cash: number;
  total: number;
  balance: number;
}

function SuperAdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tabParam = searchParams.get('tab') || 'analytics';
  const activeTab = ['analytics', 'colleges', 'admins', 'logs', 'payments', 'broadcasts', 'aiconfig'].includes(tabParam) 
    ? (tabParam as 'analytics' | 'colleges' | 'admins' | 'logs' | 'payments' | 'broadcasts' | 'aiconfig') 
    : 'analytics';

  const setActiveTab = (tab: string) => {
    router.push(`/superadmin?tab=${tab}`);
  };

  interface SystemBroadcast {
    id: string;
    title: string;
    content: string;
    type: 'Maintenance' | 'Upgrade' | 'Billing' | 'General';
    targetRoles: string[];
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    active: boolean;
    created: string;
    views: number;
  }

  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Forms states
  const [newSchool, setNewSchool] = useState({ name: '', code: '', address: '', email: '' });
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', collegeId: '' });
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>([
    {
      id: '1',
      title: 'Scheduled Database Migration & Maintenance',
      content: 'We will be performing a major database engine upgrade on Aug 20th from 02:00 AM to 04:00 AM IST. All portals will be temporarily inaccessible.',
      type: 'Maintenance',
      targetRoles: ['All'],
      priority: 'Critical',
      active: true,
      created: '2026-08-18',
      views: 45
    },
    {
      id: '2',
      title: 'Central UPI Payment Settlement Upgrades',
      content: 'PhonePe settlement delays resolved. Settlement times restored to T+1 cycles for all schools.',
      type: 'Billing',
      targetRoles: ['finance'],
      priority: 'Medium',
      active: true,
      created: '2026-08-15',
      views: 12
    }
  ]);

  const [newBroad, setNewBroad] = useState({
    title: '',
    content: '',
    type: 'Maintenance' as 'Maintenance' | 'Upgrade' | 'Billing' | 'General',
    targetRoles: [] as string[],
    priority: 'High' as 'Low' | 'Medium' | 'High' | 'Critical',
  });

  interface SchoolAIQuota {
    id: string;
    schoolName: string;
    monthlyScanLimit: number | 'Unlimited';
    activeOcrModel: 'Gemini Pro' | 'Gemini Flash' | 'Tesseract';
    scansUsed: number;
    creditsSpent: number;
    timetableModule: boolean;
    autoRemindersModule: boolean;
  }

  const [schoolQuotas, setSchoolQuotas] = useState<SchoolAIQuota[]>([
    {
      id: '1',
      schoolName: 'Bharathi Matriculation Higher Secondary School',
      monthlyScanLimit: 2000,
      activeOcrModel: 'Gemini Flash',
      scansUsed: 1450,
      creditsSpent: 4350,
      timetableModule: true,
      autoRemindersModule: true,
    },
    {
      id: '2',
      schoolName: 'Delhi Public School',
      monthlyScanLimit: 500,
      activeOcrModel: 'Tesseract',
      scansUsed: 490,
      creditsSpent: 1470,
      timetableModule: false,
      autoRemindersModule: true,
    },
    {
      id: '3',
      schoolName: 'St. Xavier Academy',
      monthlyScanLimit: 'Unlimited',
      activeOcrModel: 'Gemini Pro',
      scansUsed: 890,
      creditsSpent: 6230,
      timetableModule: true,
      autoRemindersModule: true,
    }
  ]);

  const [globalOcr, setGlobalOcr] = useState<'Gemini Pro' | 'Gemini Flash' | 'Tesseract'>('Gemini Flash');
  const [globalSolver, setGlobalSolver] = useState<'OR-Tools' | 'Genetic Local'>('OR-Tools');

  // Mock static data for other tabs
  const [admins, setAdmins] = useState<AdminData[]>([
    { id: '1', name: 'Dr. Raghavan Nair', username: 'principal101', college: 'Bharathi Matriculation', status: 'Changed', created: '2026-07-21' },
    { id: '2', name: 'Mrs. Gayatri Varma', username: 'vp_gayatri', college: 'Bharathi Matriculation', status: 'Pending Change', created: '2026-07-25' },
    { id: '3', name: 'Dr. John Miller', username: 'dps_admin', college: 'Delhi Public International', status: 'Changed', created: '2026-07-06' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: '2026-08-18 10:14 PM', action: 'UPDATED_AI_ACCESS', details: 'AI models enabled for Bharathi Matriculation', actor: 'Founder', tenant: 'BMHSS' },
    { timestamp: '2026-08-18 09:44 PM', action: 'PROVISION_ADMIN', details: 'Assigned Principal account to Dr. Raghavan Nair', actor: 'Founder', tenant: 'BMHSS' },
    { timestamp: '2026-08-17 04:12 PM', action: 'PROVISION_TENANT', details: 'Onboarded Delhi Public International School', actor: 'System Auto', tenant: 'DPIS' },
    { timestamp: '2026-08-15 08:00 AM', action: 'CONFIG_PAYMENT_GATEWAY', details: 'Verified central UPI platform gateway settlement credentials', actor: 'Founder', tenant: 'GLOBAL' },
  ]);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    { college: 'Bharathi Matriculation', mode: 'Central Platform', platform: 9013165, own: 0, cash: 312300, total: 9325465, balance: 112300 },
    { college: 'Delhi Public School', mode: 'Central Platform', platform: 4500000, own: 0, cash: 120000, total: 4620000, balance: 85000 },
    { college: 'St. Xavier Academy', mode: 'Central Platform', platform: 3200000, own: 0, cash: 95000, total: 3295000, balance: 0 },
  ]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools/public');
      const mapped = res.data.map((s: any, idx: number) => {
        const cleanName = s.name.replace(/[^a-zA-Z0-9\s]/g, '');
        const words = cleanName.split(/\s+/).filter((w: string) => w.length > 0);
        const generatedCode = words.length >= 2 
          ? words.map((w: string) => w[0]).join('').toUpperCase().slice(0, 4) 
          : s.name.slice(0, 4).toUpperCase();
        return {
          ...s,
          code: s.code || generatedCode,
          status: s.status || (idx === 1 ? 'SUSPENDED' : 'ACTIVE'),
          joined: s.joined || `2026-07-${15 + idx}`,
        };
      });
      setSchools(mapped);
    } catch (err) {
      console.error('Failed to fetch schools', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchoolStatus = (id: string) => {
    setSchools(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        toast.success(`School Status toggled to ${nextStatus}`, s.name);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleAddSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.code) return;
    
    const created: SchoolData = {
      id: Math.random().toString(),
      name: newSchool.name,
      code: newSchool.code.toUpperCase(),
      address: newSchool.address || 'Global Campus Site',
      contact_email: newSchool.email || 'info@school.edu',
      status: 'ACTIVE',
      joined: new Date().toISOString().split('T')[0]
    };
    
    setSchools(prev => [...prev, created]);
    setShowAddSchool(false);
    setNewSchool({ name: '', code: '', address: '', email: '' });
    toast.success('Successfully provisioned new school workspace!', created.name);
    
    setAuditLogs(prev => [
      { timestamp: 'Just Now', action: 'PROVISION_TENANT', details: `Onboarded ${created.name} successfully`, actor: 'Founder', tenant: created.code },
      ...prev
    ]);
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.username) return;
    
    const selectedSchool = schools.find(s => s.id === newAdmin.collegeId)?.name || 'Multi-Tenant Scope';
    
    const created: AdminData = {
      id: Math.random().toString(),
      name: newAdmin.name,
      username: newAdmin.username,
      college: selectedSchool,
      status: 'Pending Change',
      created: new Date().toISOString().split('T')[0]
    };

    setAdmins(prev => [...prev, created]);
    setShowAddAdmin(false);
    setNewAdmin({ name: '', username: '', collegeId: '' });
    toast.success('System Administrator account provisioned!', created.name);

    setAuditLogs(prev => [
      { timestamp: 'Just Now', action: 'PROVISION_ADMIN', details: `Linked admin account to ${selectedSchool}`, actor: 'Founder', tenant: 'GLOBAL' },
      ...prev
    ]);
  };

  const handlePayout = (collegeName: string) => {
    setPayments(prev => prev.map(p => {
      if (p.college === collegeName) {
        toast.success(`Cleared payout balance of ₹${p.balance.toLocaleString()}`, collegeName);
        return { ...p, balance: 0 };
      }
      return p;
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Dynamic Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-black tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center">
                {activeTab === 'analytics' && <Activity className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'colleges' && <Building2 className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'admins' && <Users className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'logs' && <History className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'payments' && <CreditCard className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'broadcasts' && <Megaphone className="w-6 h-6 text-fuchsia-500" />}
                {activeTab === 'aiconfig' && <Sparkles className="w-6 h-6 text-fuchsia-500" />}
              </div>
              {activeTab === 'analytics' && 'Global Analytics'}
              {activeTab === 'colleges' && 'Manage Schools'}
              {activeTab === 'admins' && 'Manage Admins'}
              {activeTab === 'logs' && 'Audit Ledgers'}
              {activeTab === 'payments' && 'Payments & Ledger'}
              {activeTab === 'broadcasts' && 'System Broadcasts'}
              {activeTab === 'aiconfig' && 'AI Core Config'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
              {activeTab === 'analytics' && 'Real-time system health metrics, workload volume, and platform overview.'}
              {activeTab === 'colleges' && 'Onboard new colleges, suspend/activate subscriptions.'}
              {activeTab === 'admins' && 'Delegate root administrators to manage specific school portals.'}
              {activeTab === 'logs' && 'View immutable audit logging of platform-wide administrative events.'}
              {activeTab === 'payments' && 'Track gateway settlements, cashless transactions, and process payouts.'}
              {activeTab === 'broadcasts' && 'Broadcast maintenance announcements, billing updates, or system alerts across the network.'}
              {activeTab === 'aiconfig' && 'Configure global model routes, adjust API quota thresholds, and inspect resource utilization logs.'}
            </p>
          </div>
        </div>

        {/* Active View Container */}
        <div className="w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'analytics' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Info alert banner */}
                  <div className="bg-fuchsia-500/10 border border-fuchsia-500/25 p-4 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">Master Operations Insight</h4>
                      <p className="text-[11px] text-fuchsia-700 dark:text-fuchsia-300 mt-1 leading-relaxed">
                        This dashboard provides real-time system metrics across all multi-tenant databases. Monitor subscription payouts, security audit feeds, and active workloads.
                      </p>
                    </div>
                  </div>

                  {/* Analytics KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center">
                        <SchoolIcon className="w-7 h-7 text-fuchsia-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Tenants</p>
                        <h3 className="text-2xl font-black text-brand-black">{schools.length} Schools</h3>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Active subscriptions</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
                        <Users className="w-7 h-7 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Active Users</p>
                        <h3 className="text-2xl font-black text-brand-black">17 Active</h3>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Across all workspaces</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                        <DollarSign className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Global Collections</p>
                        <h3 className="text-2xl font-black text-brand-black">₹1.72 Cr</h3>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Settled through Gateway</p>
                      </div>
                    </div>
                  </div>

                  {/* Processing load section */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-black mb-4">Central CPU-SAT Allocation & Analytics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-gray-600 dark:text-slate-400">Timetable Solver (OR-Tools) Load</span>
                          <span className="text-indigo-500">22% Capacity</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: '22%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-gray-600 dark:text-slate-400">OCR OCR Scanner Engine Queue</span>
                          <span className="text-fuchsia-500">8% Load</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600" style={{ width: '8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'colleges' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAddSchool(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-xs shadow-md shadow-fuchsia-500/20 hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                      Add Institution
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-gray-500 font-medium">Loading tenants database...</div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                            <tr>
                              <th className="px-6 py-4">Code</th>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Onboarded</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85">
                            {schools.map(school => (
                              <tr key={school.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-indigo-400">{school.code}</td>
                                <td className="px-6 py-4 font-semibold text-brand-black">{school.name}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                    school.status === 'ACTIVE' 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                                    {school.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-slate-400 font-medium">{school.joined}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                                  <button
                                    onClick={() => handleToggleSchoolStatus(school.id)}
                                    className={`px-3 py-1.5 rounded-lg border font-semibold text-[10px] transition-colors ${
                                      school.status === 'ACTIVE' 
                                        ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10' 
                                        : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                    }`}
                                  >
                                    {school.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'admins' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAddAdmin(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-xs shadow-md shadow-fuchsia-500/20 hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                      Provision Admin
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">College</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85">
                          {admins.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4 font-bold text-brand-black">{a.name}</td>
                              <td className="px-6 py-4 font-mono font-medium text-indigo-400">{a.username}</td>
                              <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-400">{a.college}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  a.status === 'Changed' 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                }`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-gray-600 dark:text-slate-400">{a.created}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    setAdmins(prev => prev.filter(item => item.id !== a.id));
                                    toast.success('Admin access revoked successfully', a.name);
                                  }}
                                  className="text-rose-500 hover:text-rose-600 font-semibold hover:underline"
                                >
                                  Revoke
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >


                  <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Actor</th>
                            <th className="px-6 py-4">Tenant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85">
                          {auditLogs.map((log, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4 font-mono text-gray-500 dark:text-slate-400">{log.timestamp}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded font-mono font-bold text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-brand-black">{log.details}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-slate-400 font-medium">{log.actor}</td>
                              <td className="px-6 py-4 font-mono font-bold text-fuchsia-400">{log.tenant}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >


                  {/* Payment Totals bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Revenue</div>
                      <div className="text-lg font-bold text-emerald-500 mt-1">₹17,240,465</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Platform settled</div>
                      <div className="text-lg font-bold text-indigo-500 mt-1">₹16,513,165</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Cash collections</div>
                      <div className="text-lg font-bold text-brand-black mt-1">₹727,300</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Unsettled Payouts</div>
                      <div className="text-lg font-bold text-amber-500 mt-1">
                        ₹{payments.reduce((acc, p) => acc + p.balance, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Payout Breakdown Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="px-6 py-4">College</th>
                            <th className="px-6 py-4">Mode</th>
                            <th className="px-6 py-4">Gateway</th>
                            <th className="px-6 py-4">Cash Handled</th>
                            <th className="px-6 py-4">Total Fee</th>
                            <th className="px-6 py-4">Pending Payout</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85">
                          {payments.map(p => (
                            <tr key={p.college} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4 font-bold text-brand-black">{p.college}</td>
                              <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-400">{p.mode}</td>
                              <td className="px-6 py-4 font-mono font-semibold text-gray-600 dark:text-slate-400">₹{p.platform.toLocaleString()}</td>
                              <td className="px-6 py-4 font-mono text-gray-600 dark:text-slate-400">₹{p.cash.toLocaleString()}</td>
                              <td className="px-6 py-4 font-mono font-bold text-indigo-500">₹{p.total.toLocaleString()}</td>
                              <td className="px-6 py-4 font-mono font-bold text-amber-500">₹{p.balance.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handlePayout(p.college)}
                                  disabled={p.balance === 0}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors shadow-sm ${
                                    p.balance > 0 
                                      ? 'bg-emerald-500 text-brand-black hover:opacity-90' 
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  Payout Clear
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'broadcasts' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >


                  {/* Broadcast Composer Form & Live Active Broadcasts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Composer */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-brand-black flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                        <Megaphone className="w-4 h-4 text-fuchsia-500" />
                        Create New Broadcast
                      </h3>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newBroad.title || !newBroad.content) return;
                        const created = {
                          id: Math.random().toString(),
                          title: newBroad.title,
                          content: newBroad.content,
                          type: newBroad.type,
                          targetRoles: newBroad.targetRoles.length === 0 ? ['All'] : newBroad.targetRoles,
                          priority: newBroad.priority,
                          active: true,
                          created: new Date().toISOString().split('T')[0],
                          views: 0
                        };
                        setBroadcasts(prev => [created, ...prev]);
                        setNewBroad({ title: '', content: '', type: 'Maintenance', targetRoles: [], priority: 'High' });
                        toast.success('System broadcast deployed globally!', newBroad.title);
                      }} className="space-y-4 text-xs">
                        
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Title Subject</label>
                          <input
                            type="text" value={newBroad.title} onChange={e => setNewBroad({...newBroad, title: e.target.value})}
                            required placeholder="e.g. UPI Gateway Down"
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Message Content</label>
                          <textarea
                            rows={4} value={newBroad.content} onChange={e => setNewBroad({...newBroad, content: e.target.value})}
                            required placeholder="Write detailed system notice here..."
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Notice Type</label>
                            <select
                              value={newBroad.type} onChange={e => setNewBroad({...newBroad, type: e.target.value as any})}
                              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                            >
                              <option value="Maintenance">🔧 Maintenance</option>
                              <option value="Upgrade">🚀 Upgrade</option>
                              <option value="Billing">💳 Billing Notice</option>
                              <option value="General">🔔 General Alert</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Priority</label>
                            <select
                              value={newBroad.priority} onChange={e => setNewBroad({...newBroad, priority: e.target.value as any})}
                              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Target Audience Roles</label>
                          <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700">
                            {['correspondent', 'principal', 'vice_principal', 'finance'].map(role => (
                              <label key={role} className="flex items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={newBroad.targetRoles.includes(role)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewBroad({...newBroad, targetRoles: [...newBroad.targetRoles, role]});
                                    } else {
                                      setNewBroad({...newBroad, targetRoles: newBroad.targetRoles.filter(r => r !== role)});
                                    }
                                  }}
                                  className="rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                                />
                                <span className="capitalize text-[10px] font-semibold">{role.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">Leave empty to target all portal administrators.</span>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold shadow-md shadow-fuchsia-500/20 hover:opacity-90 flex items-center justify-center gap-2"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          Publish Circular
                        </button>
                      </form>
                    </div>

                    {/* Active Logs History */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-brand-black flex items-center gap-2 px-2">
                        <History className="w-4 h-4 text-indigo-500" />
                        Live Broadcast Circulars
                      </h3>

                      <div className="space-y-3.5">
                        {broadcasts.map(b => (
                          <div
                            key={b.id}
                            className={`p-5 rounded-[24px] border transition-all ${
                              !b.active 
                                ? 'bg-gray-50/50 dark:bg-slate-900/30 border-gray-200/50 opacity-60' 
                                : b.priority === 'Critical'
                                ? 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/25'
                                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                  b.type === 'Maintenance' ? 'bg-amber-500/10 text-amber-500'
                                  : b.type === 'Upgrade' ? 'bg-cyan-500/10 text-cyan-500'
                                  : b.type === 'Billing' ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-indigo-500/10 text-indigo-500'
                                }`}>
                                  {b.type}
                                </span>
                                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] ${
                                  b.priority === 'Critical' ? 'bg-rose-500 text-white'
                                  : b.priority === 'High' ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                                }`}>
                                  {b.priority}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">• Posted {b.created}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {b.active ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-bold">Expired</span>
                                )}
                              </div>
                            </div>

                            <h4 className="text-sm font-bold text-brand-black mb-2">{b.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed mb-4">{b.content}</p>

                            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50 dark:border-slate-850">
                              <div>
                                <span className="font-semibold text-gray-500">Audience:</span>{' '}
                                <span className="capitalize font-mono bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                                  {b.targetRoles.join(', ').replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>Views: <span className="font-mono font-bold text-indigo-400">{b.views}</span></span>
                                {b.active && (
                                  <button
                                    onClick={() => {
                                      setBroadcasts(prev => prev.map(item => item.id === b.id ? { ...item, active: false } : item));
                                      toast.success('Broadcast has been expired/recalled', b.title);
                                    }}
                                    className="text-rose-500 hover:text-rose-600 font-bold hover:underline"
                                  >
                                    Expire Circular
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'aiconfig' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >


                  {/* System Wide Settings Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-brand-black flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                        <Sparkles className="w-4 h-4 text-fuchsia-500" />
                        Global LLM & OCR Routing
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Default OCR Engine</label>
                          <select
                            value={globalOcr} onChange={e => {
                              setGlobalOcr(e.target.value as any);
                              toast.success(`OCR model route set to ${e.target.value} globally!`);
                            }}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                          >
                            <option value="Gemini Flash">Gemini 1.5 Flash (Cloud)</option>
                            <option value="Gemini Pro">Gemini 1.5 Pro (Cloud)</option>
                            <option value="Tesseract">Tesseract Local (Offline)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider block">Constraint Solver</label>
                          <select
                            value={globalSolver} onChange={e => {
                              setGlobalSolver(e.target.value as any);
                              toast.success(`Constraint solver changed to ${e.target.value}!`);
                            }}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                          >
                            <option value="OR-Tools">Google OR-Tools CP-SAT</option>
                            <option value="Genetic Local">Local Genetic Algorithm Solver</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-3.5">
                      <h3 className="text-sm font-bold text-brand-black flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        AI Token Billing Settlements
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                          <span className="text-[10px] text-gray-400 uppercase block">Cloud API Credit Balance</span>
                          <span className="text-base font-bold text-emerald-500 mt-1">₹48,450.00</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                          <span className="text-[10px] text-gray-400 uppercase block">Total Solves This Month</span>
                          <span className="text-base font-bold text-indigo-400 mt-1">2,830 Solves</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quotas & Limits table */}
                  <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-brand-black">Tenant Specific AI Resource Quotas</h3>
                      <p className="text-[11px] text-gray-400 mt-1">Tweak maximum allowed document scans, active neural engines, and verify usage progress.</p>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="px-6 py-4">School Tenant</th>
                            <th className="px-6 py-4">Monthly Scan Limit</th>
                            <th className="px-6 py-4">Active OCR Route</th>
                            <th className="px-6 py-4">Usage this month</th>
                            <th className="px-6 py-4">Modules Enabled</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85">
                          {schoolQuotas.map(q => {
                            const limitNum = q.monthlyScanLimit === 'Unlimited' ? 999999 : q.monthlyScanLimit;
                            const pct = Math.min(100, Math.round((q.scansUsed / limitNum) * 100));

                            return (
                              <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4 font-bold text-brand-black max-w-xs truncate">{q.schoolName}</td>
                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-350">
                                  <select
                                    value={q.monthlyScanLimit}
                                    onChange={(e) => {
                                      const val = e.target.value === 'Unlimited' ? 'Unlimited' : parseInt(e.target.value);
                                      setSchoolQuotas(prev => prev.map(item => item.id === q.id ? { ...item, monthlyScanLimit: val } : item));
                                      toast.success(`Scan limit updated for ${q.schoolName}`);
                                    }}
                                    className="px-2.5 py-1 rounded bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500 font-mono font-bold"
                                  >
                                    <option value={500}>500 Scans</option>
                                    <option value={2000}>2,000 Scans</option>
                                    <option value={5000}>5,000 Scans</option>
                                    <option value="Unlimited">Unlimited</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={q.activeOcrModel}
                                    onChange={(e) => {
                                      const val = e.target.value as any;
                                      setSchoolQuotas(prev => prev.map(item => item.id === q.id ? { ...item, activeOcrModel: val } : item));
                                      toast.success(`OCR engine updated to ${val}`);
                                    }}
                                    className="px-2.5 py-1 rounded bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500 font-semibold"
                                  >
                                    <option value="Gemini Flash">Gemini Flash</option>
                                    <option value="Gemini Pro">Gemini Pro</option>
                                    <option value="Tesseract">Tesseract Local</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 space-y-1">
                                  <div className="flex justify-between font-mono text-[10px] font-semibold text-gray-500">
                                    <span>{q.scansUsed} / {q.monthlyScanLimit}</span>
                                    <span>{pct}%</span>
                                  </div>
                                  <div className="w-28 h-2 bg-gray-150 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 space-y-1 text-[10px]">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-350">
                                    <input
                                      type="checkbox" checked={q.timetableModule}
                                      onChange={(e) => {
                                        setSchoolQuotas(prev => prev.map(item => item.id === q.id ? { ...item, timetableModule: e.target.checked } : item));
                                        toast.success(`OR-Tools Timetable solver ${e.target.checked ? 'activated' : 'deactivated'} for school.`);
                                      }}
                                      className="rounded text-fuchsia-600 focus:ring-fuchsia-500 w-3 h-3"
                                    />
                                    <span>Schedule Solver</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 dark:text-slate-350">
                                    <input
                                      type="checkbox" checked={q.autoRemindersModule}
                                      onChange={(e) => {
                                        setSchoolQuotas(prev => prev.map(item => item.id === q.id ? { ...item, autoRemindersModule: e.target.checked } : item));
                                        toast.success(`Fee reminders module ${e.target.checked ? 'activated' : 'deactivated'} for school.`);
                                      }}
                                      className="rounded text-fuchsia-600 focus:ring-fuchsia-500 w-3 h-3"
                                    />
                                    <span>Auto Fee Reminders</span>
                                  </label>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => toast.success("Synced custom quotas successfully to active Kubernetes pods!", q.schoolName)}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-semibold text-[10px] hover:opacity-90 transition-opacity"
                                  >
                                    Sync Quota
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* MODAL 1: ADD NEW WORKSPACE INSTITUTION */}
        {showAddSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-brand-black">Onboard New Institution</h3>
                <button onClick={() => setShowAddSchool(false)} className="text-gray-400 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSchoolSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">School Name</label>
                  <input
                    type="text" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                    required placeholder="e.g. St. Joseph Academy"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 uppercase tracking-wider block">Short Code</label>
                    <input
                      type="text" value={newSchool.code} onChange={e => setNewSchool({...newSchool, code: e.target.value})}
                      required placeholder="e.g. SJA"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 uppercase tracking-wider block">Admin Email</label>
                    <input
                      type="email" value={newSchool.email} onChange={e => setNewSchool({...newSchool, email: e.target.value})}
                      required placeholder="e.g. admin@sja.edu"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Physical Address</label>
                  <input
                    type="text" value={newSchool.address} onChange={e => setNewSchool({...newSchool, address: e.target.value})}
                    placeholder="e.g. 50 Park Street, City Center"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowAddSchool(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold shadow-md shadow-fuchsia-500/20"
                  >
                    Provision Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: PROVISION SYSTEM ADMIN */}
        {showAddAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-brand-black">Link Administrator Account</h3>
                <button onClick={() => setShowAddAdmin(false)} className="text-gray-400 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Admin Full Name</label>
                  <input
                    type="text" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                    required placeholder="e.g. Dr. Felix Jon"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Admin Username</label>
                  <input
                    type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                    required placeholder="e.g. admin_felix"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Assign School Domain</label>
                  <select
                    value={newAdmin.collegeId} onChange={e => setNewAdmin({...newAdmin, collegeId: e.target.value})}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-black focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="">Choose a school tenant...</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowAddAdmin(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold shadow-md shadow-fuchsia-500/20"
                  >
                    Assign Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
      </div>
    }>
      <SuperAdminDashboardContent />
    </Suspense>
  );
}
