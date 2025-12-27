
import React, { useState } from 'react';
import { LEAVE_TYPES, CLASSES, CollegeClass, User } from '../types';
import { Calendar, User as UserIcon, Send, Sparkles, Loader2, Info } from 'lucide-react';

interface LeaveFormProps {
  user: User;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ user, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    applicantName: user.name,
    studentClass: user.role === 'STUDENT' ? (CLASSES[0] as CollegeClass | undefined) : undefined,
    startDate: '',
    endDate: '',
    type: LEAVE_TYPES[0],
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-teal-600 text-white">
          <h2 className="text-3xl font-black">
            {user.role === 'STUDENT' ? 'Submit Leave' : 'Staff Leave Request'}
          </h2>
          <p className="text-teal-100 font-medium opacity-90">
            {user.role === 'STUDENT' 
              ? 'Fill in your details to begin the approval process.'
              : 'Your request will be sent directly to the Principal for approval.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="text"
                disabled={user.role !== 'STUDENT'}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 disabled:opacity-70"
                placeholder="Enter your name"
                value={formData.applicantName}
                onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.role === 'STUDENT' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Class</label>
                <select
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 appearance-none"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({...formData, studentClass: e.target.value as CollegeClass})}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className={`space-y-2 ${user.role !== 'STUDENT' ? 'md:col-span-2' : ''}`}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Type</label>
              <select
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for Leave</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700"
              placeholder="Provide a clear reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          {user.role !== 'STUDENT' && (
            <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700">
              <Info size={20} className="shrink-0" />
              <p className="text-sm font-medium">As a faculty member, your leave application bypassing the CC and CoC steps and goes straight to the Principal for final approval.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
