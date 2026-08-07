"use client";

import { useState } from "react";
import { 
  Bell, 
  Plus, 
  Calendar, 
  Tag, 
  Sparkles, 
  Megaphone, 
  UserCheck,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface AnnouncementItem {
  id: string;
  title: string;
  author: string;
  date: string;
  category: "all" | "academic" | "event" | "urgent";
  content: string;
  pinned: boolean;
}

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const canPost = user && ['teacher', 'admin', 'principal', 'vice_principal', 'super_admin', 'correspondent'].includes(user.role);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: "ann-1",
      title: "Revised Science Practical Timings for Term 1 Examination",
      author: "Dr. Sarah Connor (Head of Science)",
      date: "Aug 06, 2026",
      category: "academic",
      content: "Physics practical lab batches for Grade 10-A will assemble in Room 204 starting at 09:00 AM sharp with printed lab record notebooks.",
      pinned: true
    },
    {
      id: "ann-2",
      title: "Independence Day Celebrations — Uniform & Assembly Guidelines",
      author: "Principal's Office",
      date: "Aug 05, 2026",
      category: "event",
      content: "All students are requested to be present in ceremonial white uniform by 08:00 AM on August 15th for the flag hoisting parade.",
      pinned: true
    },
    {
      id: "ann-3",
      title: "Annual Sports Day House Selection & Relay Trials",
      author: "Physical Education Department",
      date: "Aug 03, 2026",
      category: "event",
      content: "Inter-house 100m, 400m sprint and high-jump trials begin this Friday after period 4 on the main athletics pavilion.",
      pinned: false
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: "",
    category: "academic",
    content: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncements(prev => [{
      id: `ann-${Date.now()}`,
      title: newAnn.title,
      author: user?.full_name || "Faculty",
      date: "Today",
      category: newAnn.category as any,
      content: newAnn.content,
      pinned: false
    }, ...prev]);
    toast.success(`Published circular: ${newAnn.title}`, "Announcement Published");
    setShowModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Institutional Circulars
              </span>
              <span className="text-xs text-gray-600">• School-wide Bulletin</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Announcements & Circulars Board
            </h1>
            <p className="text-xs text-gray-600">
              Official school broadcasts, examination notifications, holiday circulars, and departmental updates.
            </p>
          </div>

          {canPost && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-brand-black font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Circular</span>
            </button>
          )}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {announcements.map(a => (
            <div
              key={a.id}
              className={`bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border space-y-3 transition-all ${
                a.pinned ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-gray-200 hover:border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.pinned && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                      PINNED
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] uppercase">
                    {a.category}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">• {a.date}</span>
                </div>
                <span className="text-xs text-gray-600">Posted by <span className="text-gray-800 font-medium">{a.author}</span></span>
              </div>

              <h2 className="text-base font-bold text-brand-black">{a.title}</h2>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-950/40 p-3.5 rounded-xl border border-gray-200/80">
                {a.content}
              </p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Broadcast School Circular</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Circular Subject</label>
                  <input
                    type="text"
                    value={newAnn.title}
                    onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Category</label>
                  <select
                    value={newAnn.category}
                    onChange={e => setNewAnn({ ...newAnn, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  >
                    <option value="academic">Academic Circular</option>
                    <option value="event">Event & Sports</option>
                    <option value="urgent">Urgent Notice</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Circular Content</label>
                  <textarea
                    rows={4}
                    value={newAnn.content}
                    onChange={e => setNewAnn({ ...newAnn, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-blue text-brand-black font-semibold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                  >
                    Publish Circular
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
