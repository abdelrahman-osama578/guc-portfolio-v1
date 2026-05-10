// src/pages/Portfolio/PortfolioList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Heart, ExternalLink, MapPin, BookOpen } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const PortfolioList = () => {
  // FIXED: Separated currentUser into useAuth() where it belongs!
  const { users, toggleFavorite, favorites, projects, invitations } = useData();
  const { currentUser } = useAuth(); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); 

  const availableTabs = currentUser?.role === 'Student' 
    ? ['All', 'Student', 'Collaborator', 'Course Instructor'] 
    : ['All', 'Student', 'Course Instructor', 'Employer'];

  const filteredUsers = users.filter(user => {
    if (user.role === 'Administrator') return false;
    
    if (currentUser?.role === 'Student') {
      if (user.role === 'Employer') return false;
      
      if (roleFilter === 'Collaborator') {
        if (user.role !== 'Student') return false;
        if (user.id === currentUser.id) return false; 
        
        const isCollaborator = projects.some(p => {
           const iAmCreator = p.creatorId === currentUser.id;
           const theyAreCreator = p.creatorId === user.id;
           const iAmCollab = invitations.some(inv => inv.projectId === p.id && inv.receiverId === currentUser.id && inv.status === 'accepted');
           const theyAreCollab = invitations.some(inv => inv.projectId === p.id && inv.receiverId === user.id && inv.status === 'accepted');
           
           return (iAmCreator && theyAreCollab) || (theyAreCreator && iAmCollab) || (iAmCollab && theyAreCollab);
        });
        
        if (!isCollaborator) return false;
      }
    }

    if (roleFilter !== 'All' && roleFilter !== 'Collaborator') {
      if (user.role !== roleFilter) return false;
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const companyName = (user.companyName || '').toLowerCase();
      const major = (user.major || '').toLowerCase();
      const skillsMatch = user.skills?.some(s => s.toLowerCase().includes(query));
      const courseMatch = user.role === 'Course Instructor' && user.linkedCourses?.some(c => c.toLowerCase().includes(query));

      if (!fullName.includes(query) && !companyName.includes(query) && !major.includes(query) && !skillsMatch && !courseMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Directory</h2>
        
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full xl:w-auto">
          
          <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-auto shadow-inner overflow-x-auto" role="group" aria-label="Filter by role">
            {availableTabs.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                aria-pressed={roleFilter === role}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  roleFilter === role 
                    ? 'bg-white shadow-sm text-primary border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {role === 'Course Instructor' ? 'Instructor' : role}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-64 shrink-0">
            <label htmlFor="directory-search" className="sr-only">Search the directory</label>
            <Search aria-hidden="true" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              id="directory-search"
              type="text" 
              placeholder="Search people, courses, companies..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-surface border border-dashed border-gray-300 rounded-3xl p-16 text-center text-gray-500">
          No users match your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => {
            const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === user.id && f.type === 'portfolio');
            const displayName = user.role === 'Employer' ? user.companyName : `${user.firstName} ${user.lastName}`;
            const hasSubInfo = user.major || user.address || (user.role === 'Course Instructor' && user.linkedCourses?.length > 0);

            return (
              <div key={user.id} className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col group relative">
                
                <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 relative">
                  {/* --- THE LIKE BUTTON --- */}
                  {currentUser && currentUser.id !== user.id && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); 
                        // FIXED: Added currentUser.id back into the function!
                        toggleFavorite(currentUser.id, user.id, 'portfolio'); 
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm transition-all hover:scale-110 hover:shadow-md z-20 group/btn"
                      title={isFav ? "Unlike Portfolio" : "Like Portfolio"}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          isFav 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-400 group-hover/btn:text-red-400' 
                        }`} 
                      />
                    </button>
                  )}
                </div>

                <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-3">
                    <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-50 shadow-sm overflow-hidden -mt-8 relative z-10">
                      <img src={user.profilePic} alt={`Profile picture of ${displayName}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {user.role === 'Course Instructor' ? 'Instructor' : user.role}
                    </span>
                  </div>

                  <Link to={`/portfolios/${user.id}`}>
                    <h3 className="text-lg font-bold text-primary hover:text-blue-600 transition-colors">
                      {displayName}
                    </h3>
                  </Link>

                  {hasSubInfo && (
                    <p className="text-xs text-gray-500 font-medium mt-1 flex items-center line-clamp-1">
                      {user.role === 'Employer' ? <><MapPin aria-hidden="true" className="w-3 h-3 mr-1 shrink-0"/> {user.address}</> : 
                       user.role === 'Course Instructor' ? <><BookOpen aria-hidden="true" className="w-3 h-3 mr-1 shrink-0"/> {user.linkedCourses.join(', ')}</> : 
                       user.major}
                    </p>
                  )}

                  {user.role === 'Student' && user.skills && user.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
                      {user.skills.slice(0, 5).map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold">
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 5 && (
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-md text-[10px] font-bold">
                          +{user.skills.length - 5} <span className="sr-only">more skills</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <Link to={`/portfolios/${user.id}`} className="flex items-center justify-center w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors border border-gray-200 group-hover:border-blue-200 group-hover:text-blue-700">
                      View Profile 
                      <span className="sr-only">of {displayName}</span>
                      <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioList;