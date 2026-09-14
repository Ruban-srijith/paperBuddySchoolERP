"use client";

import { useState, useRef, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  UserCircle, Settings, Shield, Bell, Key, Camera,
  Briefcase, Clock, Calendar, CheckCircle2,
  FileSignature, PieChart, Users, BookOpen, AlertTriangle, Building, CreditCard,
  MapPin, Phone, Mail, Activity, GraduationCap, TrendingUp, Loader2, Upload
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'role'>('general');
  const [sameAddress, setSameAddress] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General details
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 9876543210");
  const [address, setAddress] = useState(user?.address || "123 Main Street, Chennai, TN - 600040");
  const [signature, setSignature] = useState(user?.signature || "");
  const [broadcastSignature, setBroadcastSignature] = useState(user?.broadcast_signature || "");
  const [isSaving, setIsSaving] = useState(false);

  // Extended personal details
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("1985-05-15");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [aadhaar, setAadhaar] = useState("XXXX-XXXX-1234");
  const [nationality, setNationality] = useState("Indian");

  // Family details
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");

  // Principal-specific dashboard states
  const [officeHours, setOfficeHours] = useState("Mon-Fri, 10:00 AM - 12:00 PM");
  const [isDelegated, setIsDelegated] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
      if (user.signature) setSignature(user.signature);
      if (user.broadcast_signature) setBroadcastSignature(user.broadcast_signature);
    }

    // Load persisted extras from localStorage
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const storedExtras = localStorage.getItem(`pb_profile_extra_${user.id}`);
        if (storedExtras) {
          const parsed = JSON.parse(storedExtras);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.dob) setDob(parsed.dob);
          if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
          if (parsed.aadhaar) setAadhaar(parsed.aadhaar);
          if (parsed.nationality) setNationality(parsed.nationality);
          if (parsed.fatherName) setFatherName(parsed.fatherName);
          if (parsed.fatherPhone) setFatherPhone(parsed.fatherPhone);
          if (parsed.fatherOccupation) setFatherOccupation(parsed.fatherOccupation);
          if (parsed.motherName) setMotherName(parsed.motherName);
          if (parsed.motherPhone) setMotherPhone(parsed.motherPhone);
          if (parsed.motherOccupation) setMotherOccupation(parsed.motherOccupation);
        }
        const storedHours = localStorage.getItem(`pb_principal_office_hours_${user.id}`);
        if (storedHours) setOfficeHours(storedHours);
        const storedDelegated = localStorage.getItem(`pb_principal_delegated_${user.id}`);
        if (storedDelegated) setIsDelegated(storedDelegated === 'true');
      } catch (e) {
        console.error("Failed to load local extras", e);
      }
    }

    // Refresh from backend
    api.get('/auth/me').then(res => {
      if (res.data) {
        if (res.data.full_name) setFullName(res.data.full_name);
        if (res.data.phone) setPhone(res.data.phone);
        if (res.data.address) setAddress(res.data.address);
        if (res.data.signature) setSignature(res.data.signature);
        if (res.data.broadcast_signature) setBroadcastSignature(res.data.broadcast_signature);
      }
    }).catch(() => {});
  }, [user?.id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await api.put('/auth/me', {
        full_name: fullName,
        phone: phone,
        address: address,
        signature: signature || undefined,
        broadcast_signature: broadcastSignature || undefined
      });
      
      // Persist extended fields locally
      if (typeof window !== 'undefined' && user?.id) {
        localStorage.setItem(`pb_profile_extra_${user.id}`, JSON.stringify({
          gender,
          dob,
          bloodGroup,
          aadhaar,
          nationality,
          fatherName,
          fatherPhone,
          fatherOccupation,
          motherName,
          motherPhone,
          motherOccupation
        }));
      }

      await useAuthStore.getState().refreshUser();
      showToast("Profile information saved successfully.");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSignature = async (sigBase64: string, isBroadcast: boolean = false) => {
    try {
      if (isBroadcast) {
        setBroadcastSignature(sigBase64);
        await api.put('/auth/me', { broadcast_signature: sigBase64 });
      } else {
        setSignature(sigBase64);
        await api.put('/auth/me', { signature: sigBase64 });
      }
      await useAuthStore.getState().refreshUser();
      showToast(isBroadcast ? "Broadcast signature updated!" : "Official digital signature saved successfully!");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to save signature.");
    }
  };

  const handleSaveOfficeHours = () => {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`pb_principal_office_hours_${user.id}`, officeHours);
    }
    showToast("Public office hours saved successfully.");
  };

  const handleToggleDelegation = () => {
    const nextVal = !isDelegated;
    setIsDelegated(nextVal);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`pb_principal_delegated_${user.id}`, String(nextVal));
    }
    showToast(nextVal ? "Approval authority delegated to Vice-Principal." : "Authority delegation revoked.");
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
        await api.patch(
          '/auth/me/profile-picture',
          { profile_picture: base64String }
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              <Shield className="w-3 h-3 text-indigo-600" />
              {role.replace('_', ' ')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-black mb-2">{fullName || user.full_name}</h1>
            <p className="text-gray-500 text-lg mb-4">{user.email}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={() => showToast("Password reset link sent to email.")}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-black text-sm font-medium transition-colors flex items-center gap-2"
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
                ? 'bg-gray-100 text-brand-black shadow-sm font-bold' 
                : 'text-gray-500 hover:text-brand-black hover:bg-gray-50'
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'role' 
                ? 'bg-gray-100 text-brand-black shadow-sm font-bold' 
                : 'text-gray-500 hover:text-brand-black hover:bg-gray-50'
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
                <div className="lg:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Email Address (Login Identity)</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-lg px-3 py-2 text-sm outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gender</label>
                  <select 
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Blood Group</label>
                  <select 
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Aadhaar Number</label>
                  <input 
                    type="text" 
                    value={aadhaar}
                    onChange={e => setAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nationality</label>
                  <select 
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="Indian">Indian</option>
                    <option value="Other">Other</option>
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
                  <input 
                    type="text" 
                    placeholder="e.g. S. Raman" 
                    value={fatherName}
                    onChange={e => setFatherName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father's Mobile</label>
                  <input 
                    type="text" 
                    placeholder="+91 9876500001" 
                    value={fatherPhone}
                    onChange={e => setFatherPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father's Occupation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Professor / Civil Servant" 
                    value={fatherOccupation}
                    onChange={e => setFatherOccupation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. R. Lakshmi" 
                    value={motherName}
                    onChange={e => setMotherName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother's Mobile</label>
                  <input 
                    type="text" 
                    placeholder="+91 9876500002" 
                    value={motherPhone}
                    onChange={e => setMotherPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother's Occupation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Educator" 
                    value={motherOccupation}
                    onChange={e => setMotherOccupation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin className="w-5 h-5 text-gray-500" /> Address Details
              </h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Residential / Postal Address</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Postal Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Door No, Street Name, City, State, Pincode"
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Role Dashboard Tab */}
        {activeTab === 'role' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Correspondent / Super Admin */}
            {(role === 'correspondent' || role === 'super_admin') && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-fuchsia-400" /> Official Signatory & Stamp
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed text-center min-h-40 flex flex-col justify-center items-center">
                      {signature ? (
                        <div className="space-y-2 mb-3">
                          <img src={signature} alt="Digital Signature" className="h-14 max-w-full mx-auto object-contain border p-1 rounded bg-white shadow-sm" />
                          <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Official Signatory Verified
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 mb-3">
                          <FileSignature className="w-10 h-10 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-500">Upload your digital signature to auto-sign reports and certificates.</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        id="signatureUpload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleSaveSignature(reader.result as string, false);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="signatureUpload" className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-sm">
                        {signature ? "Replace Signature" : "Upload Signature"}
                      </label>
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
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.active} onChange={() => showToast("Notification preference updated.")} />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
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
                          <td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs">Success</span></td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/20">
                          <td className="px-4 py-3">Yesterday, 08:30 PM</td>
                          <td className="px-4 py-3 font-mono text-xs">10.0.0.15</td>
                          <td className="px-4 py-3">iPhone / Safari</td>
                          <td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs">Success</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Principal Role Dashboard */}
            {role === 'principal' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Digital Signature & Seal */}
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-amber-500" /> Official Signatory & Seal
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed text-center min-h-40 flex flex-col justify-center items-center">
                      {signature ? (
                        <div className="space-y-2 mb-3">
                          <img src={signature} alt="Digital Signature" className="h-14 max-w-full mx-auto object-contain border p-1 rounded bg-white shadow-sm" />
                          <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Official Principal Signature Verified
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 mb-3">
                          <FileSignature className="w-10 h-10 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-500">Upload your digital signature to auto-sign marksheets, report cards & ID passes.</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        id="principalSignatureUpload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleSaveSignature(reader.result as string, false);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="principalSignatureUpload" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-sm">
                        {signature ? "Replace Signature" : "Upload Digital Signature"}
                      </label>
                    </div>
                  </div>

                  {/* Public Office Hours */}
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" /> Public Office Hours
                      </h2>
                      <p className="text-xs text-gray-500 mb-2">Office hours displayed on parent portal for visitor meetings.</p>
                      <input 
                        type="text" 
                        value={officeHours}
                        onChange={e => setOfficeHours(e.target.value)}
                        placeholder="e.g. Mon-Fri, 10:00 AM - 12:00 PM" 
                        className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 mb-3 text-sm" 
                      />
                    </div>
                    <button 
                      onClick={handleSaveOfficeHours} 
                      className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors text-xs font-bold shadow-sm"
                    >
                      Save Office Hours
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Authority Delegation */}
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-500" /> Authority Delegation
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Temporarily delegate approval authority to the Vice-Principal when away from campus.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Vice-Principal Proxy Status</h4>
                        <span className="text-[11px] text-gray-500">{isDelegated ? "Active • Vice-Principal has proxy access" : "Inactive • Principal exclusive"}</span>
                      </div>
                      <button 
                        onClick={handleToggleDelegation} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isDelegated 
                            ? "bg-rose-600 hover:bg-rose-700 text-white" 
                            : "bg-amber-600 hover:bg-amber-700 text-white"
                        }`}
                      >
                        {isDelegated ? "Revoke Delegation" : "Delegate Authority"}
                      </button>
                    </div>
                  </div>

                  {/* Broadcast Signature */}
                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-500" /> Broadcast Signature Text
                    </h2>
                    <p className="text-xs text-gray-500 mb-2">Appended to circulars and official email dispatches.</p>
                    <textarea 
                      rows={3} 
                      value={broadcastSignature}
                      onChange={e => setBroadcastSignature(e.target.value)}
                      placeholder="e.g. Dr. K. Bharathi, Principal&#10;Bharathi Matriculation Higher Secondary School&#10;Excellence in Education" 
                      className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-amber-500 mb-3" 
                    />
                    <button 
                      onClick={() => handleSaveSignature(broadcastSignature, true)} 
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors text-xs font-bold shadow-sm"
                    >
                      Save Signature Text
                    </button>
                  </div>
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
                    <button onClick={() => showToast("Proxy mode activated.")} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-bold">
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
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Casual Leave (CL)</span><span className="text-brand-black font-bold">8 / 12</span></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[66%] rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Sick Leave (SL)</span><span className="text-brand-black font-bold">4 / 10</span></div>
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
                        <span className="bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded text-xs font-bold">18 Periods/Wk</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-brand-black font-medium text-sm">Mathematics</p>
                          <p className="text-gray-500 text-xs">Grade 10</p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded text-xs font-bold">8 Periods/Wk</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" /> Skill Badges
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-gray-50 border border-teal-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center"><BookOpen className="w-3 h-3 text-teal-600" /></div>
                        <span className="text-xs text-gray-700">Advanced OCR Grader</span>
                      </div>
                      <div className="bg-gray-50 border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Activity className="w-3 h-3 text-emerald-600" /></div>
                        <span className="text-xs text-gray-700">First Aid Certified</span>
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
                      <input type="text" defaultValue="https://meet.google.com/abc-defg-hij" className="w-full bg-white border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 mb-3" />
                      <button onClick={() => showToast("Meeting link saved.")} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-black rounded-lg transition-colors text-xs font-semibold">Save Link</button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="text-brand-black text-sm font-medium mb-2">Quiet Hours (DND)</h3>
                      <p className="text-xs text-gray-500 mb-3">Mute non-critical parent messages.</p>
                      <input type="time" defaultValue="18:00" className="w-full bg-white border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 mb-3" />
                      <button onClick={() => showToast("DND hours updated.")} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-black rounded-lg transition-colors text-xs font-semibold">Save DND</button>
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
                      <CreditCard className="w-5 h-5 text-cyan-500" /> Digital ID Card
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
                      <PieChart className="w-5 h-5 text-blue-500" /> Academic Progress
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Credits Earned</span>
                          <span className="text-cyan-600 font-bold">85 / 120</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-[70%] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Overall Attendance</span>
                          <span className="text-emerald-600 font-bold">92%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[92%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Medical Alerts
                    </h2>
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm">
                      <strong className="block text-rose-900 mb-1">Severe Peanut Allergy</strong>
                      EpiPen stored in Nurse Station A. Must carry secondary EpiPen at all times.
                    </div>
                    <div className="mt-4 flex gap-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Asthma (Mild)</span>
                    </div>
                  </div>

                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" /> Extracurricular Portfolio
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="min-w-[150px] bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mb-2 font-bold">DB</div>
                      <p className="text-sm text-brand-black font-medium">Debate Team</p>
                      <p className="text-xs text-gray-500">Captain (2026)</p>
                    </div>
                    <div className="min-w-[150px] bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mb-2 font-bold">CS</div>
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
                      <Users className="w-5 h-5 text-violet-500" /> Mentee Roster
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-violet-500/20 hover:text-violet-700 transition-colors cursor-pointer" title={`Student ${i+1}`}>
                          S{i+1}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">12 Students assigned to your mentorship cohort.</p>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-500" /> Availability & Booking
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-brand-black text-sm font-medium">Accept 1-on-1 Sessions</h3>
                          <p className="text-xs text-gray-500">Allow calendar bookings.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => showToast("Booking status updated.")} />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-black rounded-lg transition-colors text-sm flex items-center justify-center gap-2 font-semibold">
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
                      <CreditCard className="w-5 h-5 text-green-600" /> Approval Limit
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                      <p className="text-4xl font-bold text-brand-black mb-2">₹5,00,000</p>
                      <p className="text-xs text-gray-500">Max per-transaction authorization</p>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" /> Financial Year
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
                      <select className="w-full bg-white border border-gray-200 text-brand-black rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" onChange={() => showToast("Financial year switched.")}>
                        <option>FY 2026-2027</option>
                        <option>FY 2025-2026</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-teal-600" /> Bank Integration
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">HDFC Primary</span>
                        <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded border border-green-200">Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">SBI Salary A/C</span>
                        <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded border border-green-200">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" /> Recent Audit Trail
                  </h2>
                  <div className="space-y-2">
                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-brand-black">Approved Lab Equipment Invoice #8892</p>
                        <p className="text-xs text-gray-500">Today, 11:20 AM</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-gray-700">-₹42,000.00</span>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-brand-black">Approved Bus Maintenance Bill</p>
                        <p className="text-xs text-gray-500">Yesterday, 04:15 PM</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-gray-700">-₹18,500.00</span>
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
                      <Building className="w-5 h-5 text-indigo-500" /> Assigned Blocks
                    </h2>
                    <div className="flex gap-3">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex-1 text-center">
                        <p className="text-2xl font-bold text-indigo-700">A</p>
                        <p className="text-xs text-indigo-800 mt-1">Boys Hostel</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-1 text-center">
                        <p className="text-2xl font-bold text-blue-700">B</p>
                        <p className="text-xs text-blue-800 mt-1">Boys Hostel</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" /> Shift Schedule
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center h-[104px] flex flex-col justify-center">
                      <p className="text-brand-black font-medium">Night Duty</p>
                      <p className="text-sm text-gray-500">08:00 PM — 06:00 AM</p>
                      <p className="text-xs text-indigo-600 font-bold mt-1">Active Shift</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Emergency Protocols
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div>
                        <span className="block text-sm text-brand-black font-medium">City Hospital</span>
                        <span className="text-xs text-gray-500">Ambulance Dispatch</span>
                      </div>
                      <button onClick={() => showToast("Calling Hospital...")} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors border border-rose-200">CALL</button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div>
                        <span className="block text-sm text-brand-black font-medium">Principal</span>
                        <span className="text-xs text-gray-500">Direct Line (Urgent only)</span>
                      </div>
                      <button onClick={() => showToast("Calling Principal...")} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-200">CALL</button>
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
                      <Settings className="w-5 h-5 text-teal-500" /> Scanner Config
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex flex-col justify-center">
                      <select className="w-full bg-white border border-gray-200 text-brand-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" onChange={() => showToast("Hardware mode updated.")}>
                        <option>RFID Reader (Active)</option>
                        <option>Barcode Scanner</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" /> Reading Stats
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-brand-black">412</p>
                        <p className="text-xs text-gray-500">Books Issued This Month</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-teal-500" /> Procurement Limit
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-24 flex flex-col justify-center">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Budget Used</span>
                        <span className="text-teal-700 font-bold">₹1,25,000 / ₹3,50,000</span>
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
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </ProtectedRoute>
  );
}
