"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Clock, 
  User, 
  Sparkles,
  BookOpen
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface DoubtItem {
  id: string;
  student_name: string;
  grade: string;
  subject: string;
  question: string;
  asked_at: string;
  answer?: string;
  answered_at?: string;
  status: "open" | "resolved";
}

export default function AcademicDoubtsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeDoubt, setActiveDoubt] = useState<DoubtItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const [doubts, setDoubts] = useState<DoubtItem[]>([
    {
      id: "d1",
      student_name: "Kishor Kumar",
      grade: "10-A",
      subject: "Physics",
      question: "In Lenz's Law, why is the induced current always in a direction that opposes the change in magnetic flux?",
      asked_at: "Aug 06, 2026 (08:30 AM)",
      status: "open"
    },
    {
      id: "d2",
      student_name: "Priya Sharma",
      grade: "10-A",
      subject: "Physics",
      question: "Could you clarify the difference between total internal reflection and refraction at the critical angle?",
      asked_at: "Aug 05, 2026",
      answer: "At the critical angle, the angle of refraction is 90°. For any angle of incidence greater than the critical angle, the light reflects back entirely into the denser medium without passing into the rarer medium.",
      answered_at: "Aug 05, 2026 (04:15 PM)",
      status: "resolved"
    },
    {
      id: "d3",
      student_name: "Rohan Iyer",
      grade: "9-A",
      subject: "Chemistry",
      question: "Why does hydrochloric acid conduct electricity in aqueous solution but dry HCl gas does not?",
      asked_at: "Aug 06, 2026 (09:10 AM)",
      status: "open"
    }
  ]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoubt || !replyText) return;

    setDoubts(prev => prev.map(d => d.id === activeDoubt.id ? {
      ...d,
      answer: replyText,
      answered_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "resolved"
    } : d));

    toast.success(`Sent academic answer to ${activeDoubt.student_name}!`, "Doubt Resolved");
    setActiveDoubt(null);
    setReplyText("");
  };

  return (
    <ProtectedRoute allowedRoles={["teacher", "super_admin", "admin", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
              Faculty Academic Support
            </span>
            <span className="text-xs text-gray-600">• Student Doubts & Clarifications</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
            Student Academic Doubts & Queries
          </h1>
          <p className="text-xs text-gray-600">
            Address student conceptual questions, post explanations, and maintain subject doubt archives.
          </p>
        </div>

        {/* Doubts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doubts.map(d => (
            <div
              key={d.id}
              className={`bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                d.status === 'open' ? 'border-cyan-500/40 bg-gray-50/50' : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {d.subject} • {d.grade}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {d.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Asked by <span className="text-brand-black font-semibold">{d.student_name}</span> ({d.asked_at})</p>
                  <h3 className="text-sm font-bold text-brand-black mt-1 leading-snug">{d.question}</h3>
                </div>

                {d.answer && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                    <div className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Your Explanation ({d.answered_at}):</div>
                    {d.answer}
                  </div>
                )}
              </div>

              {d.status === 'open' && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveDoubt(d);
                      setReplyText("");
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Answer Question</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Answer Modal */}
        {activeDoubt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-brand-black">Answer {activeDoubt.student_name}'s Query</h3>
              <p className="text-xs text-cyan-300 italic">"{activeDoubt.question}"</p>

              <form onSubmit={handleSendReply} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  placeholder="Type conceptual explanation and reference key equations..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  required
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveDoubt(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-gray-950 font-bold text-xs shadow-md shadow-cyan-600/30 hover:bg-cyan-500 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Explanation
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
