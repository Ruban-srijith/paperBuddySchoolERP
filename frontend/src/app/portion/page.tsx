"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  Sparkles,
  PieChart,
  ListChecks
} from "lucide-react";

interface TopicDetail {
  id: string;
  chapter_name: string;
  topic_name: string;
  weightage_percent: number;
  is_completed: boolean;
  completed_at?: string;
}

interface SubjectProgress {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  total_nodes: number;
  completed_nodes: number;
  completion_percentage: number;
  completed_weightage_percent: number;
  topics: TopicDetail[];
}

function PortionTrackerContent() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [progressData, setProgressData] = useState<SubjectProgress | null>(null);
  const [subjects, setSubjects] = useState<{id: string, code: string, name: string}[]>([]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch('/api/v1/portion-tracker/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            setSelectedSubject(data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchSubjects();
  }, []);

  const fetchProgress = async (subjectId: string) => {
    if (!subjectId) return;
    try {
      const res = await fetch(`/api/v1/portion-tracker/subject/${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressData(data);
      } else {
        setProgressData(null);
      }
    } catch (e) {
      setProgressData(null);
    }
  };

  useEffect(() => {
    fetchProgress(selectedSubject);
  }, [selectedSubject]);

  const currentP = progressData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Feature 4: Smart Syllabus Portion Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-black">Syllabus Completion & Target Analytics</h1>
          <p className="text-xs text-gray-600">
            Auto-calculated percentage (`completed_nodes / total_syllabus_topics * 100`) driven by database triggers.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
          <span className="text-gray-600 font-medium">Select Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id} className="text-brand-black">{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!currentP ? (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
           <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
           <h3 className="text-lg font-semibold text-gray-800">No Portion Data</h3>
           <p className="text-sm text-gray-500 mt-2">There is no portion tracking data available for this subject.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Circular Progress Gauge Card */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Syllabus Completion Gauge</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
              Term Target: 75%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-800"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-amber-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${(currentP.completion_percentage / 100) * 263.8} 263.8`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-brand-black">{currentP.completion_percentage.toFixed(0)}%</span>
                <p className="text-[10px] text-gray-600 font-medium">Completed</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Nodes Completed</span>
              <span className="font-mono text-gray-800 font-semibold">{currentP.completed_nodes} / {currentP.total_nodes}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total Weightage Achieved</span>
              <span className="font-mono text-amber-400 font-semibold">{currentP.completed_weightage_percent}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown Topics List */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <ListChecks className="w-4 h-4 text-amber-400" />
              <span>Chapter Topic Node Breakdown</span>
            </h2>
            <span className="text-xs text-gray-600">
              {currentP.subject_code} - {currentP.subject_name}
            </span>
          </div>

          <div className="space-y-3">
            {currentP.topics.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  t.is_completed
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                      {t.chapter_name}
                    </span>
                    <span className="text-xs font-bold text-brand-black">{t.topic_name}</span>
                  </div>
                  <p className="text-[11px] text-gray-600">Weightage: {t.weightage_percent}% of Term Exam</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {t.is_completed ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Log</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function PortionTrackerPage() {
  return (
    <ProtectedRoute>
      <PortionTrackerContent />
    </ProtectedRoute>
  );
}
