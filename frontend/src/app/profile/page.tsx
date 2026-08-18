"use client";

import { useState, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from 'axios';
import { useAuthStore } from "@/store/authStore";
import { 
  UserCircle, Settings, Shield, Bell, Key, Camera,
  Briefcase, Clock, Calendar, CheckCircle2,
  FileSignature, PieChart, Users, BookOpen, AlertTriangle, Building, CreditCard,
  MapPin, Phone, Mail, Activity, GraduationCap, TrendingUp
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'role'>('general');
  const [sameAddress, setSameAddress] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const token = localStorage.getItem('pb_token') || localStorage.getItem('token');
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/me/profile-picture`,
          { profile_picture: base64String },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        useAuthStore.getState().checkAuth(); // refresh user
        showToast("Profile picture updated!");
      } catch (err) {
        console.error("Failed to upload image", err);
        showToast("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  const role = user.role;
  const roleColors: Record<string, string> = {
    super_admin: "from-fuchsia-500 to-purple-600",
    correspondent: "from-fuchsia-500 to-purple-600",
    admin: "from-blue-500 to-indigo-600",
    principal: "from-amber-500 to-orange-600",
    vice_principal: "from-orange-400 to-rose-500",
    teacher: "from-emerald-400 to-teal-500",
    student: "from-cyan-400 to-blue-500",
    parent: "from-pink-400 to-rose-500",
    mentor: "from-violet-400 to-purple-500",
    finance: "from-green-500 to-emerald-600",
    warden: "from-indigo-400 to-blue-600",
    librarian: "from-teal-400 to-emerald-500",
  };
  const color = roleColors[role] || "from-gray-500 to-gray-600";

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'vice_principal', 'teacher', 'student', 'mentor', 'finance', 'warden', 'librarian']}>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="bg-white shadow-sm p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${color} opacity-10 blur-3xl rounded-full pointer-events-none`}></div>
          
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-white" />
              )}
              
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4 text-gray-500" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-700 text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              {role.replace('_', ' ')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-black mb-2">{user.full_name}</h1>
            <p className="text-gray-500 text-lg mb-4">{user.email}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={() => showToast("Password reset link sent to email.")}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-700 text-brand-black text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Key className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white shadow-sm p-1 rounded-xl border border-gray-100 max-w-md mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'general' 
                ? 'bg-gray-100 text-brand-black shadow-sm' 
                : 'text-gray-500 hover:text-brand-black hover:bg-gray-100'
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'role' 
                ? 'bg-gray-100 text-brand-black shadow-sm' 
                : 'text-gray-500 hover:text-brand-black hover:bg-gray-100'
            }`}
          >
            Role Dashboard
          </button>
        </div>

        {/* General Information Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Personal Details */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <UserCircle className="w-5 h-5 text-gray-500" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">First Name</label>
                  <input type="text" defaultValue={user.full_name.split(' ')[0]} className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                  <input type="text" defaultValue={user.full_name.split(' ').slice(1).join(' ') || ''} className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gender</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                  <input type="date" defaultValue="1990-01-01" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Blood Group</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                  <input type="text" defaultValue="+91 9876543210" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Aadhaar Number</label>
                  <input type="text" defaultValue="XXXX-XXXX-1234" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nationality</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option>Indian</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Family Details */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Users className="w-5 h-5 text-gray-500" /> Family Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father/Guardian Name</label>
                  <input type="text" placeholder="John Doe Sr." className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father's Mobile</label>
                  <input type="text" placeholder="+91 9876500001" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father's Occupation</label>
                  <input type="text" placeholder="Engineer" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother Name</label>
                  <input type="text" placeholder="Jane Doe" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother's Mobile</label>
                  <input type="text" placeholder="+91 9876500002" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother's Occupation</label>
                  <input type="text" placeholder="Teacher" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin className="w-5 h-5 text-gray-500" /> Address Details
              </h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Door No & Street Name</label>
                    <input type="text" placeholder="123 Main Street" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City</label>
                    <input type="text" placeholder="Mumbai" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                    <input type="text" placeholder="400001" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-300">Communication Address</h3>
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sameAddress}
                      onChange={(e) => setSameAddress(e.target.checked)}
                      className="rounded bg-gray-100 border-gray-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    Same as Permanent
                  </label>
                </div>
                {!sameAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Door No & Street Name</label>
                      <input type="text" placeholder="" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <input type="text" placeholder="" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                      <input type="text" placeholder="" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => showToast("Profile information saved successfully.")}
                className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-brand-black rounded-xl transition-colors text-sm font-bold shadow-lg shadow-indigo-900/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Role Dashboard Tab */}
        {activeTab === 'role' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Correspondent / Super Admin */}
            {(role === 'correspondent' || role === 'super_admin' || role === 'admin') && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-fuchsia-400" /> Official Signatory
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 border-dashed text-center h-40 flex flex-col justify-center">
                      <FileSignature className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-3">Upload your digital signature to auto-sign documents.</p>
                      <button onClick={() => showToast("Signature uploaded.")} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-brand-black rounded-lg transition-colors text-xs mx-auto">
                        Upload Signature
                      </button>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" /> Global Notifications
                    </h2>
                    <div className="space-y-3">
                      {[
                        { label: "High-Value Expenses (>$10,000)", active: true },
                        { label: "Weekly Attendance Summaries", active: true },
                        { label: "Disciplinary Escalations", active: false }
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                          <span className="text-sm text-gray-300">{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.active} onChange={() => showToast("Notification preference updated.")} />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" /> Security Logs
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3">IP Address</th>
                          <th className="px-4 py-3">Device / Browser</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 bg-gray-50/20">
                          <td className="px-4 py-3">Today, 10:45 AM</td>
                          <td className="px-4 py-3 font-mono text-xs">192.168.1.104</td>
                          <td className="px-4 py-3">Windows / Chrome</td>
                          <td className="px-4 py-3"><span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs">Success</span></td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/20">
                          <td className="px-4 py-3">Yesterday, 08:30 PM</td>
                          <td className="px-4 py-3 font-mono text-xs">10.0.0.15</td>
                          <td className="px-4 py-3">iPhone / Safari</td>
                          <td className="px-4 py-3"><span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs">Success</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Principal */}
            {role === 'principal' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" /> Public Office Hours
                    </h2>
                    <input type="text" defaultValue="Mon-Fri, 10:00 AM - 12:00 PM" className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 mb-3" />
                    <button onClick={() => showToast("Office hours saved.")} className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-700 text-brand-black rounded-lg transition-colors text-sm">Save Hours</button>
                  </div>
                  
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" /> Authority Delegation
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Temporarily delegate approval authority to the Vice-Principal when on leave.</p>
                    <button onClick={() => showToast("Authority delegated to Vice-Principal.")} className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-brand-black rounded-lg transition-colors text-sm font-bold">Delegate Authority</button>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-400" /> Broadcast Signature
                  </h2>
                  <textarea 
                    rows={3} 
                    defaultValue="Dr. Alan Grant, Principal&#10;Genesis ERP International School&#10;Excellence in Education" 
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 mb-3" 
                  />
                  <button onClick={() => showToast("Signature saved.")} className="px-6 py-2 bg-gray-100 hover:bg-gray-700 text-brand-black rounded-lg transition-colors text-sm">Save Signature</button>
                </div>
              </>
            )}

            {/* Vice Principal */}
            {role === 'vice_principal' && (
              <>
                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 mb-6">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-rose-400" /> Administrative Hub
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-brand-black font-medium">Principal Proxy Mode</h3>
                      <p className="text-sm text-gray-500">Act on behalf of the Principal (Requires their delegation).</p>
                    </div>
                    <button onClick={() => showToast("Proxy mode activated.")} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-brand-black rounded-lg transition-colors text-sm font-bold">
                      Activate Proxy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-400" /> Personal Leave Balance
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Casual Leave (CL)</span><span className="text-brand-black font-bold">8 / 12</span></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[66%] rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Sick Leave (SL)</span><span className="text-brand-black font-bold">4 / 10</span></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-[40%] rounded-full"></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" /> Discipline Track Record
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm text-brand-black font-medium mb-1">Resolved: Dress Code Violation (Grade 10)</div>
                        <div className="text-xs text-gray-500">2 days ago • Issued warning letter</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm text-brand-black font-medium mb-1">Resolved: Vandalism in Lab 3</div>
                        <div className="text-xs text-gray-500">1 week ago • Parental meeting conducted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Teacher */}
            {role === 'teacher' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" /> Academic Portfolio
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-brand-black font-medium text-sm">Physics</p>
                          <p className="text-gray-500 text-xs">Grade 11 & 12</p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">18 Periods/Wk</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-brand-black font-medium text-sm">Mathematics</p>
                          <p className="text-gray-500 text-xs">Grade 10</p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">8 Periods/Wk</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" /> Skill Badges
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-gray-50 border border-teal-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center"><BookOpen className="w-3 h-3 text-teal-400" /></div>
                        <span className="text-xs text-gray-300">Advanced OCR Grader</span>
                      </div>
                      <div className="bg-gray-50 border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Activity className="w-3 h-3 text-emerald-400" /></div>
                        <span className="text-xs text-gray-300">First Aid Certified</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" /> Classroom Preferences
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="text-brand-black text-sm font-medium mb-2">Default Meeting Link</h3>
                      <input type="text" defaultValue="https://meet.google.com/abc-defg-hij" className="w-full bg-gray-100 border border-gray-700 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 mb-3" />
                      <button onClick={() => showToast("Meeting link saved.")} className="px-4 py-2 bg-gray-100 hover:bg-gray-700 text-brand-black rounded-lg transition-colors text-xs">Save Link</button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="text-brand-black text-sm font-medium mb-2">Quiet Hours (DND)</h3>
                      <p className="text-xs text-gray-500 mb-3">Mute non-critical parent messages.</p>
                      <input type="time" defaultValue="18:00" className="w-full bg-gray-100 border border-gray-700 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 mb-3" />
                      <button onClick={() => showToast("DND hours updated.")} className="px-4 py-2 bg-gray-100 hover:bg-gray-700 text-brand-black rounded-lg transition-colors text-xs">Save DND</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Student */}
            {role === 'student' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-cyan-400" /> Digital ID Card
                    </h2>
                    <div className="w-40 h-40 bg-white rounded-xl p-3 flex items-center justify-center border-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <div className="grid grid-cols-5 gap-1 w-full h-full opacity-80">
                        {Array.from({length: 25}).map((_, i) => (
                          <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'} rounded-sm`}></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Scan for Library, Cafeteria & Entry</p>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-400" /> Academic Progress
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Credits Earned</span>
                          <span className="text-cyan-400 font-bold">85 / 120</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-[70%] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Overall Attendance</span>
                          <span className="text-emerald-400 font-bold">92%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[92%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" /> Medical Alerts
                    </h2>
                    <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-300 text-sm">
                      <strong className="block text-rose-400 mb-1">Severe Peanut Allergy</strong>
                      EpiPen stored in Nurse Station A. Must carry secondary EpiPen at all times.
                    </div>
                    <div className="mt-4 flex gap-2">
                      <span className="bg-gray-100 text-gray-300 text-xs px-2 py-1 rounded">Asthma (Mild)</span>
                    </div>
                  </div>

                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" /> Extracurricular Portfolio
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="min-w-[150px] bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 font-bold">DB</div>
                      <p className="text-sm text-brand-black font-medium">Debate Team</p>
                      <p className="text-xs text-gray-500">Captain (2026)</p>
                    </div>
                    <div className="min-w-[150px] bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 font-bold">CS</div>
                      <p className="text-sm text-brand-black font-medium">Coding Club</p>
                      <p className="text-xs text-gray-500">Member</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mentor */}
            {role === 'mentor' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-violet-400" /> Mentee Roster
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-violet-500/20 hover:text-violet-300 transition-colors cursor-pointer" title={`Student ${i+1}`}>
                          S{i+1}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">12 Students assigned to your mentorship cohort.</p>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" /> Availability & Booking
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-brand-black text-sm font-medium">Accept 1-on-1 Sessions</h3>
                          <p className="text-xs text-gray-500">Allow calendar bookings.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => showToast("Booking status updated.")} />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-700 text-brand-black rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" /> Edit Shared Resource Locker
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Finance */}
            {role === 'finance' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-400" /> Approval Limit
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                      <p className="text-4xl font-bold text-brand-black mb-2">$50,000</p>
                      <p className="text-xs text-gray-500">Max per-transaction authorization</p>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-400" /> Financial Year
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
                      <select className="w-full bg-gray-100 border border-gray-700 text-brand-black rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" onChange={() => showToast("Financial year switched.")}>
                        <option>FY 2026-2027</option>
                        <option>FY 2025-2026</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-teal-400" /> Bank Integration
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">HDFC Primary</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">SBI Salary A/C</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" /> Recent Audit Trail
                  </h2>
                  <div className="space-y-2">
                    <div className="bg-gray-50/30 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-brand-black">Approved Lab Equipment Invoice #8892</p>
                        <p className="text-xs text-gray-500">Today, 11:20 AM</p>
                      </div>
                      <span className="text-sm font-mono text-gray-500">-$4,200.00</span>
                    </div>
                    <div className="bg-gray-50/30 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-brand-black">Approved Bus Maintenance Bill</p>
                        <p className="text-xs text-gray-500">Yesterday, 04:15 PM</p>
                      </div>
                      <span className="text-sm font-mono text-gray-500">-$1,850.00</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Warden */}
            {role === 'warden' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-400" /> Assigned Blocks
                    </h2>
                    <div className="flex gap-3">
                      <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4 flex-1 text-center">
                        <p className="text-2xl font-bold text-indigo-400">A</p>
                        <p className="text-xs text-indigo-200 mt-1">Boys Hostel</p>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex-1 text-center">
                        <p className="text-2xl font-bold text-blue-400">B</p>
                        <p className="text-xs text-blue-200 mt-1">Boys Hostel</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" /> Shift Schedule
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center h-[104px] flex flex-col justify-center">
                      <p className="text-brand-black font-medium">Night Duty</p>
                      <p className="text-sm text-gray-500">08:00 PM — 06:00 AM</p>
                      <p className="text-xs text-indigo-400 mt-1">Active Shift</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" /> Emergency Protocols
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50/80 border border-gray-100 rounded-xl">
                      <div>
                        <span className="block text-sm text-brand-black font-medium">City Hospital</span>
                        <span className="text-xs text-gray-500">Ambulance Dispatch</span>
                      </div>
                      <button onClick={() => showToast("Calling Hospital...")} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors">CALL</button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50/80 border border-gray-100 rounded-xl">
                      <div>
                        <span className="block text-sm text-brand-black font-medium">Principal</span>
                        <span className="text-xs text-gray-500">Direct Line (Urgent only)</span>
                      </div>
                      <button onClick={() => showToast("Calling Principal...")} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold transition-colors">CALL</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Librarian */}
            {role === 'librarian' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-teal-400" /> Scanner Config
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex flex-col justify-center">
                      <select className="w-full bg-gray-100 border border-gray-700 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" onChange={() => showToast("Hardware mode updated.")}>
                        <option>RFID Reader (Active)</option>
                        <option>Barcode Scanner</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" /> Reading Stats
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-brand-black">412</p>
                        <p className="text-xs text-gray-500">Books Issued This Month</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-teal-400" /> Procurement Limit
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex flex-col justify-center">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Budget Used</span>
                        <span className="text-teal-400 font-bold">$2k / $5k</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 w-[40%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-700 text-brand-black px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </ProtectedRoute>
  );
}
