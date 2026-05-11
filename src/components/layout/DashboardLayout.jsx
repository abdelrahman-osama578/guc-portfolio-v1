// src/components/layout/DashboardLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useData } from '../../context/DataContext';
import { AlertTriangle } from 'lucide-react';

const DashboardLayout = () => {
  const { toast, confirmDialog } = useData();
  const location = useLocation();

  const colors = ['bg-slate-200', 'bg-gray-200', 'bg-zinc-200'];

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">

      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${colors[0]} rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob`}></div>
        <div className={`absolute top-[20%] right-[-5%] w-96 h-96 ${colors[1]} rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-2000`}></div>
        <div className={`absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] ${colors[2]} rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000`}></div>
      </div>

      <Sidebar />

      {/* FIXED: Removed 'z-10' from this wrapper to prevent the Stacking Context Trap! */}
      <div className="flex-1 flex flex-col relative">
        <Topbar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto overflow-x-hidden">
          
          {/* FIXED: Removed 'animate-page-enter'. CSS transform animations prevent modals from covering the screen. */}
          <div key={location.pathname} className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 z-[100] ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-900 text-white border-gray-800'
          }`}>
          {toast.type === 'success' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="confetti-particle" style={{ left: '10%', animationDelay: '0s' }}></div>
              <div className="confetti-particle" style={{ left: '50%', animationDelay: '0.1s' }}></div>
              <div className="confetti-particle" style={{ left: '90%', animationDelay: '0.2s' }}></div>
            </div>
          )}
          {toast.message}
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
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