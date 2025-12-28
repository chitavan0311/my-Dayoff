
import React from 'react';
import { LeaveApplication, ApprovalStatus, User } from '../types';
import { Clock, CheckCircle2, XCircle, FileText, ArrowRight, Activity, TrendingUp } from 'lucide-react';

interface AdminOverviewProps {
  user: User;
  applications: LeaveApplication[];
  onNavigate: (view: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ user, applications, onNavigate }) => {
  // Logic to calculate stats based on the user's role and the sequential workflow
  const stats = React.useMemo(() => {
    let pendingForMe = 0;
    
    if (user.role === 'CLASS_COORDINATOR') {
      pendingForMe = applications.filter(app => 
        app.applicantRole === 'STUDENT' && 
        app.studentClass === user.assignedClass && 
        app.ccStatus === ApprovalStatus.PENDING
      ).length;
    } else if (user.role === 'COURSE_COORDINATOR') {
      pendingForMe = applications.filter(app => 
        app.applicantRole === 'STUDENT' && 
        app.ccStatus === ApprovalStatus.APPROVED && 
        app.cocStatus === ApprovalStatus.PENDING
      ).length;
    } else if (user.role === 'PRINCIPAL') {
      pendingForMe = applications.filter(app => {
        const isStudentAction = app.applicantRole === 'STUDENT' && app.cocStatus === ApprovalStatus.APPROVED && app.principalStatus === ApprovalStatus.PENDING;
        const isFacultyAction = app.applicantRole !== 'STUDENT' && app.principalStatus === ApprovalStatus.PENDING;
        return isStudentAction || isFacultyAction;
      }).length;
    }

    const totalApproved = applications.filter(app => app.status === 'APPROVED').length;
    const totalRejected = applications.filter(app => app.status === 'REJECTED').length;

    return { pendingForMe, totalApproved, totalRejected };
  }, [applications, user]);

  const recentApps = [...applications].sort((a, b) => 
    new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  ).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-bold mt-1">Welcome back, {user.name.split(' ')[0]}. Here is what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-black text-slate-400">
          <Activity size={14} className="text-teal-500" />
          SYSTEM LIVE
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-teal-600 p-8 rounded-[40px] text-white shadow-xl shadow-teal-100 flex flex-col justify-between aspect-square md:aspect-auto h-48">
          <Clock size={32} className="opacity-40" />
          <div>
            <p className="text-5xl font-black">{stats.pendingForMe}</p>
            <p className="text-sm font-bold opacity-80 mt-1 uppercase tracking-widest">Pending Your Action</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{stats.totalApproved}</p>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Approvals</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{stats.totalRejected}</p>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Rejections</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Activity</h2>
            <button 
              onClick={() => onNavigate('review')}
              className="text-teal-600 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all"
            >
              VIEW ALL <ArrowRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
            {recentApps.length > 0 ? (
              recentApps.map((app, idx) => (
                <div key={app.id} className={`p-6 flex items-center gap-4 ${idx !== recentApps.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                    app.applicantRole === 'STUDENT' ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {app.applicantName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm leading-none">{app.applicantName}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{app.type} • {app.appliedDate}</p>
                  </div>
                  <div className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 font-bold">No activity recorded yet.</div>
            )}
          </div>
        </div>

        {/* Quick Links / Tips */}
        <div className="bg-slate-900 p-10 rounded-[48px] text-white flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <TrendingUp size={120} />
          </div>
          <h2 className="text-3xl font-black mb-4 relative z-10">Administrative Console</h2>
          <p className="text-slate-400 font-bold mb-8 max-w-xs relative z-10">
            {user.role === 'PRINCIPAL' 
              ? "As Principal, you have final authority over all student and faculty leave requests."
              : "Ensure you review your assigned student batch requests within 24 hours."}
          </p>
          <div className="flex gap-4 relative z-10">
            <button 
              onClick={() => onNavigate('review')}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-teal-900/40"
            >
              Open Inbox
            </button>
            {user.role !== 'PRINCIPAL' && (
              <button 
                onClick={() => onNavigate('apply')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/20 transition-all"
              >
                Request Leave
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
