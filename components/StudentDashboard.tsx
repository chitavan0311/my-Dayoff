
import React from 'react';
import { LeaveApplication, ApprovalStatus } from '../types';
import { Clock, CheckCircle2, XCircle, Calendar, ChevronRight, FileText } from 'lucide-react';

interface StudentDashboardProps {
  applications: LeaveApplication[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ applications }) => {
  const getStatusStepColor = (status: ApprovalStatus) => {
    if (status === ApprovalStatus.APPROVED) return 'bg-teal-500 text-white border-teal-500';
    if (status === ApprovalStatus.REJECTED) return 'bg-rose-500 text-white border-rose-500';
    return 'bg-white text-slate-400 border-slate-200';
  };

  const ApprovalChain = ({ app }: { app: LeaveApplication }) => (
    <div className="mt-4 flex items-center justify-between max-w-sm">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${getStatusStepColor(app.ccStatus)}`}>
          CC
        </div>
        <span className="text-[10px] font-bold text-slate-400">Class Coord.</span>
      </div>
      <div className={`h-0.5 flex-1 mx-2 ${app.ccStatus === ApprovalStatus.APPROVED ? 'bg-teal-500' : 'bg-slate-200'}`} />
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${getStatusStepColor(app.cocStatus)}`}>
          CoC
        </div>
        <span className="text-[10px] font-bold text-slate-400">Course Coord.</span>
      </div>
      <div className={`h-0.5 flex-1 mx-2 ${app.cocStatus === ApprovalStatus.APPROVED ? 'bg-teal-500' : 'bg-slate-200'}`} />
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${getStatusStepColor(app.principalStatus)}`}>
          PR
        </div>
        <span className="text-[10px] font-bold text-slate-400">Principal</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800">My Applications</h1>
          <p className="text-slate-500 font-medium">Monitoring your leave requests through the hierarchy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{app.type}</span>
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={14} /> {app.startDate} — {app.endDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{app.reason}</h3>
                  <ApprovalChain app={app} />
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Current Status</p>
                    <p className={`font-black uppercase text-sm ${
                      app.status === 'APPROVED' ? 'text-teal-600' : 
                      app.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {app.status}
                    </p>
                  </div>
                  <ChevronRight size={24} className="text-slate-300" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No applications yet</h3>
            <p className="text-slate-500">Your leave requests will appear here once submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
