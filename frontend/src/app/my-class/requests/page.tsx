"use client";

import { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { Send, FileText } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function TeacherRequests() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/finance/core/requests', {
        department_id: null,
        title,
        description,
        amount: parseFloat(amount),
        priority: 'normal'
      });
      toast.success("Funding request submitted successfully to Finance!");
      setTitle('');
      setAmount('');
      setDescription('');
    } catch (err) {
      toast.error("Failed to submit request.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" />
            Request Department Funds
          </h1>
          <p className="text-gray-400 mt-2">Request funds for lab equipment, project materials, or class events.</p>
        </header>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Request Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Science Lab Chemicals"
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Requested Amount (₹)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide justification for this expense..."
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-cyan-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
            <Send className="w-5 h-5" /> Submit to Finance
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
