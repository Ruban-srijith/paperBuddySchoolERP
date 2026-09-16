"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Command, LayoutDashboard, Users, GraduationCap, 
  CheckSquare, Calendar, CreditCard, 
  Bus, Home, Library, X, FileText, Building2,
  DollarSign, Award, Clock, UserCheck, Settings, CornerDownLeft
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Action" | "Student Lookup" | "System";
  href?: string;
  action?: () => void;
  icon: any;
  shortcut?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K / Ctrl+P / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  const commandList: CommandItem[] = [
    // Navigation
    { id: "nav-dash", title: "Go to Dashboard", category: "Navigation", href: "/dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
    { id: "nav-users", title: "User Directory (Students & Teachers)", category: "Navigation", href: "/users", icon: Users, shortcut: "⌘2" },
    { id: "nav-students", title: "Student Records & Audit", category: "Navigation", href: "/student/documents", icon: Users, shortcut: "⌘3" },
    { id: "nav-depts", title: "Academic Departments", category: "Navigation", href: "/departments", icon: Building2 },
    { id: "nav-classes", title: "Classes & Allotments", category: "Navigation", href: "/classes", icon: Building2 },
    { id: "nav-staff", title: "Staff Management & Council", category: "Navigation", href: "/staff-management", icon: Users },
    { id: "nav-academics", title: "Academics & Classes View", category: "Navigation", href: "/my-class", icon: GraduationCap },
    { id: "nav-attendance", title: "Daily Attendance Ledger", category: "Navigation", href: "/attendance", icon: CheckSquare },
    { id: "nav-timetable", title: "Timetable & AI Solver", category: "Navigation", href: "/timetable", icon: Calendar },
    { id: "nav-exams", title: "Examination Center & Seating", category: "Navigation", href: "/exams", icon: FileText },
    { id: "nav-fees", title: "Fee Payment & Financial Aid", category: "Navigation", href: "/fees", icon: CreditCard },
    { id: "nav-hostel", title: "Hostel Room Allocations", category: "Navigation", href: "/warden/rooms", icon: Home },
    { id: "nav-library", title: "Digital Library Inventory", category: "Navigation", href: "/librarian", icon: Library },
    { id: "nav-transport", title: "Fleet Management & Routes", category: "Navigation", href: "/transport/fleet", icon: Bus },
    { id: "nav-settings", title: "User Settings & Profile", category: "Navigation", href: "/profile", icon: Settings },

    // Quick Actions
    { id: "act-attendance", title: "> Mark Today's Class Attendance", category: "Quick Action", href: "/attendance", icon: CheckSquare },
    { id: "act-homework", title: "> Create New Homework Assignment", category: "Quick Action", href: "/homework", icon: FileText },
    { id: "act-leave", title: "> Submit Student Leave Request", category: "Quick Action", href: "/leave-apply", icon: Clock },
    { id: "act-topper", title: "> Assign Class Toppers & Badges", category: "Quick Action", href: "/assign-toppers", icon: Award },
    { id: "act-salary", title: "> Approve Staff Salary Disbursements", category: "Quick Action", href: "/salary-approvals", icon: DollarSign },
  ];

  const filteredCommands = commandList.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      
      {/* Concrete Brutalist Outer Frame Chassis */}
      <div className="w-full max-w-2xl brutal-concrete-chassis p-3 shadow-2xl relative animate-float-3d">
        
        {/* Inner 3D Emerald Glass Command Palette */}
        <div className="glass-emerald-tile rounded-[24px] flex flex-col overflow-hidden shadow-2xl border border-[#e8e2d3]/30">
          
          {/* Top Search Header Bar */}
          <div className="p-4 border-b border-[#a3c9b0]/25 flex items-center gap-3 bg-[#12281b]/90">
            <Search className="w-5 h-5 text-[#a3c9b0] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownInput}
              placeholder="Type a command, route, or student ID (e.g. 'Attendance', '#10452', '> Homework')..."
              className="w-full bg-transparent text-[#f4f0e6] placeholder:text-[#a3c9b0]/60 text-sm font-medium focus:outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-[#a3c9b0] hover:text-[#f4f0e6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#a3c9b0] font-semibold">
                No matching commands or student records found for "{query}".
              </div>
            ) : (
              filteredCommands.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#2b4c37] border border-[#e8e2d3]/40 text-[#f4f0e6] shadow-md"
                        : "bg-[#14291e]/60 border border-[#a3c9b0]/15 text-[#e8e2d3] hover:bg-[#14291e]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#182e22] text-[#e8e2d3]" : "bg-[#12281b] text-[#a3c9b0]"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-syne">{item.title}</div>
                        <div className="text-[10px] text-[#a3c9b0] uppercase tracking-wider font-semibold">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.shortcut && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#12281b] text-[#a3c9b0] font-mono border border-[#a3c9b0]/20">
                          {item.shortcut}
                        </span>
                      )}
                      {isSelected && <CornerDownLeft className="w-4 h-4 text-[#e8e2d3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Keyboard Guide */}
          <div className="p-3 border-t border-[#a3c9b0]/20 bg-[#12281b]/80 flex items-center justify-between text-[10px] text-[#a3c9b0] font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#182e22] border border-[#a3c9b0]/30 font-mono text-[#f4f0e6]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[#182e22] border border-[#a3c9b0]/30 font-mono text-[#f4f0e6]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#182e22] border border-[#a3c9b0]/30 font-mono text-[#f4f0e6]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#182e22] border border-[#a3c9b0]/30 font-mono text-[#f4f0e6]">Esc</kbd>
                Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#e8e2d3]">
              <Command className="w-3.5 h-3.5" />
              <span>Genesis Command Palette</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
