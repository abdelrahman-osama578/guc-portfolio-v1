// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'; // FIXED: Switched NavLink to Link and added useLocation
import { Home, Folder, Users, ShoppingBag, Shield, Heart, MessageSquare, BookOpen, Briefcase, Globe } from 'lucide-react'; // Added Globe icon for Explore
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation(); // Allows us to read the current URL and hidden state

  // Define which links belong to which roles
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['Student', 'Course Instructor', 'Employer', 'Administrator'] },
    { name: 'My Projects', path: '/projects', icon: Folder, roles: ['Student', 'Course Instructor'] },
    { name: 'Portfolios', path: '/portfolios', icon: Users, roles: ['Student', 'Employer', 'Course Instructor', 'Administrator'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, roles: ['Course Instructor', 'Administrator'] },
    
    // REQ 79: Students get the Explore view
    { name: 'Explore Internships', path: '/internships', icon: ShoppingBag, roles: ['Student'] },
    
    // REQ 85: Employers get the Management hub
    { name: 'My Internships', path: '/manage-applicants', icon: Briefcase, roles: ['Employer'] }, 
    
    { name: 'Admin Panel', path: '/admin', icon: Shield, roles: ['Administrator'] },
    
    // FIXED: Point to /projects but pass the explore state!
    { name: 'Explore Projects', path: '/projects', state: { activeTab: 'explore' }, icon: Globe, roles: ['Student', 'Employer', 'Course Instructor', 'Administrator'] },
    
    { name: 'Favorites', path: '/favorites', icon: Heart, roles: ['Student', 'Employer'] },
    { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['Student', 'Course Instructor', 'Employer', 'Administrator'] }
  ];

  const visibleLinks = navItems.filter(item => item.roles.includes(currentUser?.role));

  return (
    <aside className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50">
      <div className="h-20 flex items-center px-8 border-b border-gray-50 justify-center shrink-0">
        <img 
          src="/German_University_in_Cairo_logo.png" 
          alt="GUC Logo" 
          className="h-10 w-auto object-contain mr-3" 
        />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleLinks.map((item) => {
          // --- SMART HIGHLIGHTING LOGIC ---
          let isActive = false;

          if (item.name === 'My Projects') {
            // Active ONLY if on /projects AND state is NOT explore
            isActive = location.pathname === '/projects' && location.state?.activeTab !== 'explore';
          } else if (item.name === 'Explore Projects') {
            // Active ONLY if on /projects AND state IS explore
            isActive = location.pathname === '/projects' && location.state?.activeTab === 'explore';
          } else if (item.path === '/') {
            // Exact match for dashboard
            isActive = location.pathname === '/';
          } else {
            // Standard prefix matching for everything else
            isActive = location.pathname.startsWith(item.path);
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              state={item.state} // Passes the hidden state if the item has one
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-gray-100 text-primary font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-50 shrink-0">
        <button onClick={logout} className="flex items-center text-gray-500 hover:text-red-600 w-full px-4 py-2 transition-colors">
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;