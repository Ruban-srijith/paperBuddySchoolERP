"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Building2, Plus, Users } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function VendorsPortal() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("IT Services");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const res = await api.get('/finance/core/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !contactEmail || !contactPhone) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await api.post('/finance/core/vendors', {
        name,
        category,
        contact_email: contactEmail,
        contact_phone: contactPhone
      });
      toast.success("Vendor added successfully");
      setShowModal(false);
      setName("");
      setContactEmail("");
      setContactPhone("");
      setCategory("IT Services");
      fetchVendors();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add vendor");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-2">Manage active vendor contracts, IT services, and stationery suppliers.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No vendors found.</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-black">{v.name}</td>
                    <td className="px-6 py-4">{v.category}</td>
                    <td className="px-6 py-4">
                      <div>{v.contact_email}</div>
                      <div className="text-xs text-gray-500">{v.contact_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active Contract</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-brand-black">Add New Vendor</h2>
                <p className="text-sm text-gray-600 mt-1">Register a new supplier or service provider.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Vendor Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400" 
                    required
                  >
                    <option value="IT Services">IT Services</option>
                    <option value="Academics">Academics</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Events">Events</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Contact Phone</label>
                  <input 
                    type="text" 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400" 
                    required 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Add Vendor
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
