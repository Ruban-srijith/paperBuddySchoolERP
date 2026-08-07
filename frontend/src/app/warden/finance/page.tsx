"use client";

import { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { Wrench, Send } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function WardenRequests() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/finance/core/requests', {
        department_id: "dept1111-1111-1111-1111-111111111111", // Using science dept as placeholder for warden
        title,
        description,
        amount: parseFloat(amount),
        priority: 'high'
      });
      toast.success("Maintenance fund request submitted!");
      setTitle('');
      setAmount('');
      setDescription('');
    } catch (err) {
      toast.error("Failed to submit request.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <Wrench className="w-8 h-8 text-amber-400" />
            Hostel Finance Requests
          </h1>
          <p className="text-gray-600 mt-2">Request funds for hostel maintenance, food supplies, repairs, and utilities.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 rounded-2xl border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Request Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Block A Plumbing Repairs"
              className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Estimated Amount (₹)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Urgency & Justification</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain why these funds are needed immediately..."
              className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-amber-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-brand-black font-bold py-4 rounded-xl flex justify-center items-center gap-2">
            <Send className="w-5 h-5" /> Submit to Finance
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
