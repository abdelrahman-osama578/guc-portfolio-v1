// src/components/layout/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useData } from '../../context/DataContext'; 
import { AlertTriangle } from 'lucide-react'; // <-- Imported for the Modal

const DashboardLayout = () => {
  // Grab BOTH the toast and our new confirmDialog
  const { toast, confirmDialog } = useData();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>

      {/* THE TOAST UI */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 z-50 ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-900 text-white border-gray-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* --- THE NEW GLOBAL CONFIRMATION MODAL UI --- */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Please Confirm</h3>
            </div>
            
            {/* The dynamic message we pass in */}
            <p className="text-sm text-gray-600 mb-6 pl-13 leading-relaxed">{confirmDialog.message}</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={confirmDialog.onCancel} 
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;