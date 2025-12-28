
import React, { useState, useMemo, useEffect } from 'react';
import { LeaveApplication, ApprovalStatus, User, CLASSES, CollegeClass } from '../types';
import { CheckCircle2, XCircle, Search, Calendar, Sparkles, Filter, UserCheck, ArrowRightCircle, Eye, Inbox, History, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  applications: LeaveApplication[];
  onUpdateStatus: (id: string, stage: 'CC' | 'CoC' | 'PR', status: ApprovalStatus, comment?: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, applications, onUpdateStatus }) => {
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [viewMode, setViewMode] = useState<'PENDING' | 'EXECUTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'ALL' | CollegeClass>('ALL');

  // Default Normal Faculty to Executed since they have no pending actions
  useEffect(() => {
    if (user.role === 'NORMAL_FACULTY') {
      setViewMode('EXECUTED');
    }
  }, [user.role]);

  const filteredApps = useMemo(() => {
    let baseApps = applications;

    // Filter by Search and Class first
    baseApps = baseApps.filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           app.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === 'ALL' || app.studentClass === filterClass;
      const notMe = app.applicantId !== user.id;
      return matchesSearch && matchesClass && notMe;
    });

    if (viewMode === 'PENDING') {
      // Pending logic: Items specifically waiting for THIS user's turn
      return baseApps.filter(app => {
        if (app.status !== 'PENDING') return false;

        if (user.role === 'CLASS_COORDINATOR') {
          return app.applicantRole === 'STUDENT' && 
                 app.studentClass === user.assignedClass && 
                 app.ccStatus === ApprovalStatus.PENDING;
        }
        if (user.role === 'COURSE_COORDINATOR') {
          return app.applicantRole === 'STUDENT' && 
                 app.ccStatus === ApprovalStatus.APPROVED && 
                 app.cocStatus === ApprovalStatus.PENDING;
        }
        if (user.role === 'PRINCIPAL') {
          const isStudentTurn = app.applicantRole === 'STUDENT' && app.cocStatus === ApprovalStatus.APPROVED && app.principalStatus === ApprovalStatus.PENDING;
          const isFacultyTurn = app.applicantRole !== 'STUDENT' && app.principalStatus === ApprovalStatus.PENDING;
          return isStudentTurn || isFacultyTurn;
        }
        return false; // Normal Faculty has no pending actions
      });
    } else {
      // Executed Archive: Items that are either Approved, Rejected, or passed this user's stage
      return baseApps.filter(app => {
        const isProcessed = app.status === 'APPROVED' || app.status === 'REJECTED';
        
        // Also show items that have already passed the current user's specific stage
        let hasPassedMyStage = false;
        if (user.role === 'CLASS_COORDINATOR') hasPassedMyStage = app.ccStatus !== ApprovalStatus.PENDING;
        if (user.role === 'COURSE_COORDINATOR') hasPassedMyStage = app.cocStatus !== ApprovalStatus.PENDING;
        if (user.role === 'PRINCIPAL') hasPassedMyStage = app.principalStatus !== ApprovalStatus.PENDING;
        if (user.role === 'NORMAL_FACULTY') hasPassedMyStage = true; // Faculty sees all history

        return isProcessed || hasPassedMyStage;
      });
    }
  }, [applications, user, viewMode, searchTerm, filterClass]);

  const canApprove = (app: LeaveApplication) => {
    if (user.role === 'NORMAL_FACULTY') return false;
    if (app.status !== 'PENDING') return false;

    if (user.role === 'CLASS_COORDINATOR') return app.ccStatus === ApprovalStatus.PENDING;
    if (user.role === 'COURSE_COORDINATOR') return app.cocStatus === ApprovalStatus.PENDING;
    if (user.role === 'PRINCIPAL') return app.principalStatus === ApprovalStatus.PENDING;
    return false;
  };

  const handleAction = (status: ApprovalStatus) => {
    if (selectedApp) {
      const stage = user.role === 'CLASS_COORDINATOR' ? 'CC' : (user.role === 'COURSE_COORDINATOR' ? 'CoC' : 'PR');
      onUpdateStatus(selectedApp.id, stage, status);
      setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Global Filter */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search student or reason..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value as any)}
            className="bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 rounded-2xl px-4 py-3 outline-none flex-1 md:w-48"
          >
            <option value="ALL">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {/* Main Navigation Tabs for List */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => { setViewMode('PENDING'); setSelectedApp(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'PENDING' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Inbox size={14} /> Pending
            </button>
            <button 
              onClick={() => { setViewMode('EXECUTED'); setSelectedApp(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'EXECUTED' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <History size={14} /> Executed
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all group relative overflow-hidden ${
                    selectedApp?.id === app.id ? 'border-teal-500 bg-teal-50/30 shadow-md' : 'border-white bg-white shadow-sm hover:border-slate-200'
                  }`}
                >
                  {viewMode === 'PENDING' && (
                    <div className="absolute top-0 right-0 p-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md">
                      {app.studentClass || 'STAFF'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{app.appliedDate}</span>
                  </div>
                  <p className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-teal-700">{app.applicantName}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">{app.reason}</p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status}
                    </span>
                    <div className="flex gap-0.5">
                       <div className={`w-3 h-1.5 rounded-full ${app.ccStatus === 'APPROVED' ? 'bg-emerald-400' : app.ccStatus === 'REJECTED' ? 'bg-rose-400' : 'bg-slate-200'}`} title="CC" />
                       <div className={`w-3 h-1.5 rounded-full ${app.cocStatus === 'APPROVED' ? 'bg-emerald-400' : app.cocStatus === 'REJECTED' ? 'bg-rose-400' : 'bg-slate-200'}`} title="CoC" />
                       <div className={`w-3 h-1.5 rounded-full ${app.principalStatus === 'APPROVED' ? 'bg-emerald-400' : app.principalStatus === 'REJECTED' ? 'bg-rose-400' : 'bg-slate-200'}`} title="PR" />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] p-12 text-center">
                <p className="text-slate-300 font-bold text-sm">No applications found in this section.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-teal-100 rounded-[28px] flex items-center justify-center text-teal-600 font-black text-3xl">
                    {selectedApp.applicantName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedApp.applicantName}</h2>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        selectedApp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        selectedApp.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedApp.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-bold text-sm mt-1">
                      {selectedApp.studentClass || selectedApp.applicantRole} • Applied {selectedApp.appliedDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                    <div className="flex items-center gap-3 text-slate-800 font-black text-lg">
                      <Calendar size={22} className="text-teal-600" />
                      <span>{selectedApp.startDate} — {selectedApp.endDate}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason Type</p>
                    <p className="text-slate-800 font-black text-lg">{selectedApp.type}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leave Explanation</p>
                    <div className="text-slate-700 bg-slate-50 p-8 rounded-[32px] text-xl leading-relaxed font-bold border border-slate-100 italic">
                      "{selectedApp.reason}"
                    </div>
                  </div>

                  {selectedApp.aiSummary && (
                    <div className="bg-teal-50 border border-teal-100 p-8 rounded-[32px]">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="text-teal-600" size={20} />
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">AI Context</p>
                      </div>
                      <p className="text-teal-900 font-black text-lg">{selectedApp.aiSummary}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision Pathway</p>
                        {viewMode === 'EXECUTED' && (
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <History size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Historical Record</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between max-w-xl mx-auto px-4">
                      {[
                        { label: 'CC', status: selectedApp.ccStatus },
                        { label: 'CoC', status: selectedApp.cocStatus },
                        { label: 'PR', status: selectedApp.principalStatus }
                      ].map((step, idx) => (
                        <React.Fragment key={step.label}>
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-[24px] border-2 flex items-center justify-center font-black text-xl transition-all ${
                              step.status === ApprovalStatus.APPROVED ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' :
                              step.status === ApprovalStatus.REJECTED ? 'bg-rose-600 text-white border-rose-600' :
                              'bg-white text-slate-300 border-slate-100'
                            }`}>
                              {step.label}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idx === 0 ? 'Class' : idx === 1 ? 'Course' : 'Principal'}</span>
                          </div>
                          {idx < 2 && (
                            <div className={`h-1.5 flex-1 mx-2 rounded-full ${
                              step.status === ApprovalStatus.APPROVED ? 'bg-emerald-500' : 'bg-slate-100'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Actions: Only if Pending AND current user's turn */}
                {viewMode === 'PENDING' && canApprove(selectedApp) && (
                  <div className="pt-10 flex gap-6">
                    <button 
                      onClick={() => handleAction(ApprovalStatus.REJECTED)} 
                      className="flex-1 py-6 px-8 border-2 border-rose-100 text-rose-600 font-black rounded-[28px] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 text-xl"
                    >
                      <XCircle size={24} /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(ApprovalStatus.APPROVED)} 
                      className="flex-1 py-6 px-8 bg-teal-600 text-white font-black rounded-[28px] hover:bg-teal-700 shadow-2xl shadow-teal-100 transition-all flex items-center justify-center gap-3 text-xl"
                    >
                      <CheckCircle2 size={24} /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[48px] border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                {viewMode === 'PENDING' ? <AlertCircle className="text-amber-200" size={48} /> : <History className="text-slate-200" size={48} />}
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {viewMode === 'PENDING' ? 'Inbox Selection' : 'Archive Selection'}
              </h2>
              <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2">
                {viewMode === 'PENDING' 
                  ? "Select an application from the 'Pending' list to review and update its status."
                  : "Select any record from the 'Executed' archive to see the full approval pathway and details."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
