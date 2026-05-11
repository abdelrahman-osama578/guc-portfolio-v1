// src/components/layout/Topbar.jsx
import { Search, Bell, MessageSquare, Plus, BellOff } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Topbar = () => {
  const { currentUser } = useAuth();
  const { messages, invitations } = useData(); 
  const navigate = useNavigate(); 

  const unreadMessages = messages.filter(m => m.receiverId === currentUser?.id && !m.read).length;
  const unreadNotifications = currentUser?.notificationsMuted ? 0 : invitations.filter(inv => inv.receiverId === currentUser?.id && !inv.read).length; 

  const handleSearch = (e) => {
    // FIXED: Now we capture the value and pass it through the router state!
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const query = e.target.value.trim();
      
      if (currentUser?.role === 'Employer') {
        // Employers search portfolios (Directory) by default
        navigate('/portfolios', { state: { searchQuery: query } });
      } else {
        // Everyone else searches Explore Projects
        navigate('/explore', { state: { searchQuery: query } });
      }
      
      e.target.value = ''; // Clear input after searching
    }
  };

  const handleCreateClick = () => {
    if (currentUser?.role === 'Employer') {
      navigate('/manage-applicants', { state: { openCreate: true } }); 
    } else {
      navigate('/projects'); 
    }
  };

  return (
    <header className="h-20 bg-background flex items-center justify-between px-8 ml-64 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
      <h2 className="text-2xl font-bold text-primary tracking-tight">Dashboard</h2>

      <div className="flex items-center space-x-6">
        
        <div className="relative group">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search & hit Enter..." 
            onKeyDown={handleSearch}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 transition-all"
          />
        </div>

        <button onClick={handleCreateClick} className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create
        </button>

        <div className="flex items-center space-x-3">
          <Link to="/notifications" className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-primary hover:shadow-sm transition-all relative">
            {currentUser?.notificationsMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </Link>
          
          <Link to="/messages" className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-primary hover:shadow-sm transition-all relative">
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </Link>
        </div>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <Link to={`/portfolios/${currentUser?.id}`} className="text-sm font-bold text-primary hover:text-blue-600 transition-colors block">
              {currentUser?.firstName || currentUser?.companyName} {currentUser?.lastName}
            </Link>
            <p className="text-xs text-gray-500 font-medium">{currentUser?.role}</p>
          </div>
          
          <Link to={`/portfolios/${currentUser?.id}`}>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer shadow-sm">
              <img src={currentUser?.profilePic} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Topbar;