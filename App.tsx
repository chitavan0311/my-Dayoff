
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminOverview from './components/AdminOverview';
import LeaveForm from './components/LeaveForm';
import GameZone from './components/GameZone';
import { User, LeaveApplication, ApprovalStatus, UserRole, CLASSES, CollegeClass } from './types';
import { GraduationCap, School, ShieldCheck } from 'lucide-react';
import { generateProfessionalLetter, generateAdminSummary } from './services/geminiService';

const INITIAL_LEAVES: LeaveApplication[] = [
  {
    id: 'L-1001',
    applicantId: 'STUDENT_TEMP',
    applicantName: 'Priya Sharma',
    applicantRole: 'STUDENT',
    studentClass: '1yr BSc Nursing',
    startDate: '2024-06-01',
    endDate: '2024-06-03',
    type: 'Medical Leave',
    reason: 'Suffering from high fever.',
    status: 'PENDING',
    ccStatus: ApprovalStatus.PENDING,
    cocStatus: ApprovalStatus.PENDING,
    principalStatus: ApprovalStatus.PENDING,
    appliedDate: '2024-05-30',
    aiSummary: 'Student requests medical leave for fever.'
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<LeaveApplication[]>(INITIAL_LEAVES);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation: Dynamic Faculty Data
  const FACULTY_USERS: Record<string, User> = {
    'PR_ADMIN': { id: 'PR', name: 'Dr. Elizabeth', email: 'principal@dayoff.edu', role: 'PRINCIPAL' },
    'COC_ALL': { id: 'COC', name: 'Dr. Robert', email: 'coc@dayoff.edu', role: 'COURSE_COORDINATOR' },
    'CC_1BSC': { id: 'CC1', name: 'Mrs. Anita', role: 'CLASS_COORDINATOR', assignedClass: '1yr BSc Nursing', email: 'cc1@dayoff.edu' },
    'FAC_1': { id: 'F1', name: 'Prof. Wilson', role: 'NORMAL_FACULTY', email: 'wilson@dayoff.edu' },
  };

  const handleLogin = (role: 'STUDENT' | 'FACULTY', idInput?: string) => {
    if (role === 'STUDENT') {
      setUser({ id: 'STUDENT_TEMP', name: 'Student Demo', email: 'student@college.edu', role: 'STUDENT' });
    } else {
      const faculty = FACULTY_USERS[idInput || ''];
      if (faculty) setUser(faculty);
      else alert("ID not found. Use Demo keys (e.g., CC_1BSC, FAC_1, PR_ADMIN)");
    }
  };

  const handleApplyLeave = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const [letter, summary] = await Promise.all([
      generateProfessionalLetter(data.reason, data.type, diffDays),
      generateAdminSummary(data.reason, "Faculty request")
    ]);
    
    const isStudent = user.role === 'STUDENT';

    const newLeave: LeaveApplication = {
      ...data,
      id: `L-${Math.floor(Math.random() * 9000 + 1000)}`,
      applicantId: user.id,
      applicantName: data.applicantName || user.name,
      applicantRole: user.role,
      status: 'PENDING',
      ccStatus: isStudent ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
      cocStatus: isStudent ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
      principalStatus: ApprovalStatus.PENDING,
      appliedDate: new Date().toLocaleDateString(),
      aiSummary: summary,
      facultyComments: `System: ${user.role}. Letter: ${letter}`
    };
    
    setLeaves([newLeave, ...leaves]);
    setIsSubmitting(false);
    setCurrentView('dashboard');
  };

  const handleUpdateStatus = (id: string, stage: 'CC' | 'CoC' | 'PR', status: ApprovalStatus) => {
    setLeaves(prev => prev.map(l => {
      if (l.id !== id) return l;
      const update: Partial<LeaveApplication> = {};
      if (stage === 'CC') update.ccStatus = status;
      if (stage === 'CoC') update.cocStatus = status;
      if (stage === 'PR') update.principalStatus = status;

      if (status === ApprovalStatus.REJECTED) update.status = 'REJECTED';
      else if (stage === 'PR' && status === ApprovalStatus.APPROVED) update.status = 'APPROVED';

      return { ...l, ...update };
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl rotate-3">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter">DayOff</h1>
            <p className="text-slate-500 font-bold mt-2">Nursing College Administration</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-2xl space-y-8 border border-slate-100">
            <button onClick={() => handleLogin('STUDENT')} className="w-full flex items-center gap-5 p-5 bg-slate-50 rounded-3xl hover:bg-teal-600 group transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-teal-600"><GraduationCap size={28} /></div>
              <div className="text-left"><p className="font-black text-slate-800 group-hover:text-white">Student Portal</p><p className="text-xs font-bold text-slate-400 group-hover:text-teal-100 uppercase tracking-widest">Login directly</p></div>
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400"><School size={28} /></div>
                <div className="flex-1">
                  <p className="font-black text-slate-800">Faculty/Staff</p>
                  <input id="facId" placeholder="ID (e.g. CC_1BSC, FAC_1)" className="w-full mt-2 px-3 py-2 text-xs font-bold border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <button onClick={() => handleLogin('FACULTY', (document.getElementById('facId') as HTMLInputElement).value)} className="bg-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors">Go</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={() => setUser(null)} currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'dashboard' && (
        user.role === 'STUDENT' 
          ? <StudentDashboard applications={leaves.filter(l => l.applicantId === user.id)} />
          : <AdminOverview user={user} applications={leaves} onNavigate={setCurrentView} />
      )}
      {currentView === 'apply' && <LeaveForm user={user} onSubmit={handleApplyLeave} isSubmitting={isSubmitting} />}
      {currentView === 'review' && user.role !== 'STUDENT' && <AdminDashboard user={user} applications={leaves} onUpdateStatus={handleUpdateStatus} />}
      {currentView === 'game' && <GameZone />}
    </Layout>
  );
};

export default App;
