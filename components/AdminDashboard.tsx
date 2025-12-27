
import React, { useState, useMemo, useEffect } from 'react';
import { LeaveApplication, ApprovalStatus, User, CLASSES, CollegeClass } from '../types';
import { CheckCircle2, XCircle, Search, User as UserIcon, Calendar, Clock, FileText, Sparkles, Filter, Users, UserCheck, ArrowRightCircle } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  applications: LeaveApplication[];
  onUpdateStatus: (id: string, stage: 'CC' | 'CoC' | 'PR', status: ApprovalStatus, comment?: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, applications, onUpdateStatus }) => {
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [viewType, setViewType] = useState<'REVIEW' | 'PERSONAL'>('REVIEW');
  
  useEffect(() => {
    if (user.role === 'NORMAL_FACULTY') setViewType('PERSONAL');
    if (user.role === 'PRINCIPAL') setViewType('REVIEW');
  }, [user.role]);

  // Principal Specific Filters
  const [filterRole, setFilterRole] = useState<'ALL' | 'STUDENT' | 'FACULTY'>('ALL');
  const [filterClass, setFilterClass] = useState<'ALL' | CollegeClass>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic based on the sequential workflow
  const filteredApps = useMemo(() => {
    let baseApps = applications;

    if (viewType === 'PERSONAL') {
      return baseApps.filter(app => app.applicantId === user.id);
    }

    // Default sequential inbox logic
    if (user.role === 'CLASS_COORDINATOR') {
      // CC: Only pending student apps from their class
      baseApps = baseApps.filter(app => 
        app.applicantRole === 'STUDENT' && 
        app.studentClass === user.assignedClass && 
        app.ccStatus === ApprovalStatus.PENDING
      );
    } else if (user.role === 'COURSE_COORDINATOR') {
      // CoC: Only student apps approved by CC but pending at CoC
      baseApps = baseApps.filter(app => 
        app.applicantRole === 'STUDENT' && 
        app.ccStatus === ApprovalStatus.APPROVED && 
        app.cocStatus === ApprovalStatus.PENDING
      );
    } else if (user.role === 'PRINCIPAL') {
      // Principal sees everything, but defaults to their inbox if no filters are applied
      // If no specific status filter is picked, show "Action Required" items
      if (filterStatus === 'ALL' && filterRole === 'ALL' && filterClass === 'ALL' && searchTerm === '') {
        baseApps = baseApps.filter(app => {
          const isStudentAction = app.applicantRole === 'STUDENT' && app.cocStatus === ApprovalStatus.APPROVED && app.principalStatus === ApprovalStatus.PENDING;
          const isFacultyAction = app.applicantRole !== 'STUDENT' && app.principalStatus === ApprovalStatus.PENDING;
          return isStudentAction || isFacultyAction;
        });
      }
    } else if (user.role === 'NORMAL_FACULTY') {
      return [];
    }

    // Apply Principal's Advanced UI Filters
    if (user.role === 'PRINCIPAL') {
      baseApps = baseApps.filter(app => {
        const matchesRole = filterRole === 'ALL' || (filterRole === 'STUDENT' ? app.applicantRole === 'STUDENT' : app.applicantRole !== 'STUDENT');
        const matchesClass = filterClass === 'ALL' || app.studentClass === filterClass;
        const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
        return matchesRole && matchesClass && matchesStatus;
      });
    }

    // Apply Search Globally
    return baseApps.filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           app.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const notMe = app.applicantId !== user.id;
      return matchesSearch && notMe;
    });
  }, [applications, user, viewType, searchTerm, filterRole, filterClass, filterStatus]);

  const getStageAction = () => {
    if (user.role === 'CLASS_COORDINATOR') return 'CC';
    if (user.role === 'COURSE_COORDINATOR') return 'CoC';
    return 'PR';
  };

  const handleAction = (status: ApprovalStatus) => {
    if (selectedApp) {
      onUpdateStatus(selectedApp.id, getStageAction(), status);
      setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {user.role !== 'NORMAL_FACULTY' && (
              <button 
                onClick={() => { setViewType('REVIEW'); setSelectedApp(null); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewType === 'REVIEW' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Review Inbox
              </button>
            )}
            {user.role !== 'PRINCIPAL' && (
              <button 
                onClick={() => { setViewType('PERSONAL'); setSelectedApp(null); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewType === 'PERSONAL' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                My Applications
              </button>
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search name or keywords..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {user.role === 'PRINCIPAL' && viewType === 'REVIEW' && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-teal-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Filters:</span>
            </div>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg px-3 py-2 outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty</option>
            </select>
            <select 
              value={filterClass} 
              onChange={(e) => setFilterClass(e.target.value as any)}
              className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg px-3 py-2 outline-none"
            >
              <option value="ALL">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg px-3 py-2 outline-none"
            >
              <option value="ALL">Inbox (Action Required)</option>
              <option value="PENDING">Still Pending</option>
              <option value="APPROVED">Already Approved</option>
              <option value="REJECTED">Already Rejected</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">
              {viewType === 'REVIEW' ? 'Waiting List' : 'My Requests'}
            </h1>
            <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-1 rounded-md">
              {filteredApps.length}
            </span>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all group ${
                    selectedApp?.id === app.id ? 'border-teal-500 bg-teal-50/30 shadow-md' : 'border-white bg-white shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md">
                      {app.applicantRole === 'STUDENT' ? app.studentClass : 'FACULTY'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{app.appliedDate}</span>
                  </div>
                  <p className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-teal-700">{app.applicantName}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">{app.reason}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status}
                    </span>
                    <div className="flex items-center gap-1">
                       {app.ccStatus === 'APPROVED' && <span className="w-2 h-2 rounded-full bg-emerald-400" title="CC Approved" />}
                       {app.cocStatus === 'APPROVED' && <span className="w-2 h-2 rounded-full bg-emerald-400" title="CoC Approved" />}
                       {app.applicantRole !== 'STUDENT' && <UserCheck size={14} className="text-indigo-400" />}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                <p className="text-slate-400 font-bold text-sm">No items in this inbox.</p>
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
                      {selectedApp.applicantRole !== 'STUDENT' && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">FACULTY STAFF</span>
                      )}
                    </div>
                    <p className="text-slate-500 font-bold text-sm mt-1">
                      {selectedApp.applicantRole === 'STUDENT' ? selectedApp.studentClass : selectedApp.applicantRole.replace('_', ' ')} • ID: {selectedApp.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Leave Period</p>
                    <div className="flex items-center gap-3 text-slate-800 font-black text-lg">
                      <Calendar size={22} className="text-teal-600" />
                      <span>{selectedApp.startDate} — {selectedApp.endDate}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-slate-800 font-black text-lg">{selectedApp.type}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Applicant's Reason</p>
                    <div className="text-slate-700 bg-slate-50 p-8 rounded-[32px] text-xl leading-relaxed font-bold border border-slate-100 italic">
                      "{selectedApp.reason}"
                    </div>
                  </div>

                  {selectedApp.aiSummary && (
                    <div className="bg-teal-50 border border-teal-100 p-8 rounded-[32px]">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="text-teal-600" size={20} />
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">AI Decision Support Summary</p>
                      </div>
                      <p className="text-teal-900 font-black text-lg">{selectedApp.aiSummary}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Hierarchy Checkpoints</p>
                    {selectedApp.applicantRole === 'STUDENT' ? (
                      <div className="flex items-center justify-between max-w-lg">
                        <div className="flex flex-col items-center gap-3">
                          <span className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-lg ${selectedApp.ccStatus === ApprovalStatus.APPROVED ? 'bg-teal-600 text-white border-teal-600' : selectedApp.ccStatus === ApprovalStatus.REJECTED ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-300 border-slate-100'}`}>CC</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</span>
                        </div>
                        <div className={`h-1 flex-1 mx-3 rounded-full ${selectedApp.ccStatus === ApprovalStatus.APPROVED ? 'bg-teal-500' : 'bg-slate-100'}`} />
                        <div className="flex flex-col items-center gap-3">
                          <span className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-lg ${selectedApp.cocStatus === ApprovalStatus.APPROVED ? 'bg-teal-600 text-white border-teal-600' : selectedApp.cocStatus === ApprovalStatus.REJECTED ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-300 border-slate-100'}`}>CoC</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</span>
                        </div>
                        <div className={`h-1 flex-1 mx-3 rounded-full ${selectedApp.cocStatus === ApprovalStatus.APPROVED ? 'bg-teal-500' : 'bg-slate-100'}`} />
                        <div className="flex flex-col items-center gap-3">
                          <span className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-lg ${selectedApp.principalStatus === ApprovalStatus.APPROVED ? 'bg-teal-600 text-white border-teal-600' : selectedApp.principalStatus === ApprovalStatus.REJECTED ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-300 border-slate-100'}`}>PR</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 bg-indigo-50 p-6 rounded-[28px] border border-indigo-100">
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center font-black text-2xl ${selectedApp.principalStatus === ApprovalStatus.APPROVED ? 'bg-indigo-600 text-white shadow-lg' : selectedApp.principalStatus === ApprovalStatus.REJECTED ? 'bg-rose-600 text-white' : 'bg-white text-indigo-300 border-2 border-indigo-100'}`}>PR</div>
                        <div>
                          <p className="text-lg font-black text-indigo-900 leading-tight tracking-tight">Direct Principal Channel</p>
                          <p className="text-sm font-bold text-indigo-500 opacity-80">Final verification required by Principal.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Only show actions if it's the current user's turn to review */}
                {viewType === 'REVIEW' && selectedApp.status === 'PENDING' && (
                  <div className="pt-10 flex gap-6">
                    <button onClick={() => handleAction(ApprovalStatus.REJECTED)} className="flex-1 py-5 px-8 border-2 border-rose-200 text-rose-600 font-black rounded-[24px] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 text-lg">
                      <XCircle size={24} /> Reject Request
                    </button>
                    <button onClick={() => handleAction(ApprovalStatus.APPROVED)} className="flex-1 py-5 px-8 bg-teal-600 text-white font-black rounded-[24px] hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-3 text-lg">
                      <CheckCircle2 size={24} /> Approve Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[48px] border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <ArrowRightCircle className="text-slate-200 animate-pulse" size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Review Queue</h2>
              <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2">Select an application from the sidebar to verify details and process the request.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
