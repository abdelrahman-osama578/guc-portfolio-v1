// src/components/layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useData } from '../../context/DataContext'; 
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react'; 

const DashboardLayout = () => {
  const { toast, confirmDialog } = useData();
  const { currentUser } = useAuth();
  const location = useLocation();

  // --- PARALLAX BACKGROUND TRACKING ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getAmbientColors = () => {
    switch (currentUser?.role) {
      case 'Administrator': return ['bg-purple-200', 'bg-indigo-200', 'bg-slate-200'];
      case 'Employer': return ['bg-orange-200', 'bg-amber-200', 'bg-gray-200'];
      case 'Course Instructor': return ['bg-emerald-200', 'bg-teal-200', 'bg-gray-200'];
      default: return ['bg-slate-200', 'bg-gray-200', 'bg-zinc-200']; 
    }
  };
  
  const colors = getAmbientColors();

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      
      {/* Parallax Drafting Pattern */}
      <div 
        className="fixed -inset-20 z-0 opacity-[0.03] pointer-events-none transition-transform duration-300 ease-out" 
        style={{ 
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
          backgroundSize: '32px 32px',
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` 
        }}
      ></div>

      {/* Parallax Lighting Blobs */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
      >
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${colors[0]} rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob`}></div>
        <div className={`absolute top-[20%] right-[-5%] w-96 h-96 ${colors[1]} rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-2000`}></div>
        <div className={`absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] ${colors[2]} rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000`}></div>
      </div>

      <Sidebar />
      
      {/* FIXED: Removed z-10 as per colleague's fix */}
      <div className="flex-1 flex flex-col relative">
        <Topbar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto overflow-x-hidden">
          {/* FIXED: Removed animate-page-enter as per colleague's fix to allow modals to escape */}
          <div key={location.pathname} className="w-full max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 z-[100] ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-900 text-white border-gray-800'
        }`}>
          {toast.type === 'success' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="confetti-particle" style={{left: '10%', animationDelay: '0s'}}></div>
              <div className="confetti-particle" style={{left: '50%', animationDelay: '0.1s'}}></div>
              <div className="confetti-particle" style={{left: '90%', animationDelay: '0.2s'}}></div>
            </div>
          )}
          {toast.message}
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-gray-900">Please Confirm</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 pl-13 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={confirmDialog.onCancel} className="px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">{confirmDialog.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;