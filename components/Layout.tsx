
import React from 'react';
import { User } from '../types';
import { LogOut, LayoutDashboard, FileText, User as UserIcon, ShieldCheck, PenSquare, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentView }) => {
  const getRoleLabel = () => {
    if (user.role === 'STUDENT') return 'Student';
    if (user.role === 'PRINCIPAL') return 'Principal';
    if (user.role === 'COURSE_COORDINATOR') return 'Course Coordinator';
    if (user.role === 'CLASS_COORDINATOR') return 'Class Coordinator';
    return 'Faculty';
  };

  // All faculty roles (CC, CoC, Principal, and Normal Faculty) can access history/review
  const isFaculty = user.role !== 'STUDENT';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0f4f8]">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">DayOff</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'dashboard' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            
            {(user.role !== 'PRINCIPAL') && (
              <button
                onClick={() => onNavigate('apply')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'apply' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <PenSquare size={20} />
                <span>Apply Leave</span>
              </button>
            )}

            {isFaculty && (
              <button
                onClick={() => onNavigate('review')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'review' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText size={20} />
                <span>{user.role === 'NORMAL_FACULTY' ? 'Application History' : 'Review Requests'}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{getRoleLabel()}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
