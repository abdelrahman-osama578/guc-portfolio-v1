// src/pages/Portfolio/PortfolioList.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Heart, ExternalLink, MapPin, BookOpen, Filter, GraduationCap, Code, ArrowUpDown, Folder } from 'lucide-react';
import TiltCard from '../../components/common/TiltCard';
import SkeletonCard from '../../components/common/SkeletonCard';

const PortfolioList = () => {
  const { users, toggleFavorite, favorites, projects, invitations } = useData();
  const { currentUser } = useAuth();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
  const [roleFilter, setRoleFilter] = useState('All');
  const [majorFilter, setMajorFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortOption, setSortOption] = useState('projects_highest');

  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchTerm(location.state.searchQuery);
      window.history.replaceState({}, document.title);
    }

    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.state, location.pathname]);

  const availableTabs = currentUser?.role === 'Student'
    ? ['All', 'Student', 'Collaborator', 'Course Instructor']
    : ['All', 'Student', 'Course Instructor', 'Employer'];

  const getProjectCount = (userId) => {
    return projects.filter(p => {
      const isCreator = p.creatorId === userId;
      const isCollaborator = invitations.some(inv => inv.projectId === p.id && inv.receiverId === userId && inv.status === 'accepted');
      return (isCreator || isCollaborator) && p.visibility === 'public';
    }).length;
  };

  const uniqueMajors = [...new Set(users.map(u => u.major).filter(Boolean))].sort();
  const uniqueSkills = [...new Set(users.flatMap(u => u.skills || []))].sort();

  const filteredUsers = users.filter(user => {
    if (user.role === 'Administrator') return false; 

    if (currentUser?.role === 'Student') {
      if (user.role === 'Employer') return false;

      if (roleFilter === 'Collaborator') {
        if (user.role !== 'Student' || user.id === currentUser.id) return false;

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
      const email = (user.email || '').toLowerCase();

      if (!fullName.includes(query) && !companyName.includes(query) && !email.includes(query)) {
        return false;
      }
    }

    if (majorFilter && user.major !== majorFilter) return false;
    if (skillFilter && (!user.skills || !user.skills.includes(skillFilter))) return false;

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === 'projects_highest') return getProjectCount(b.id) - getProjectCount(a.id);
    if (sortOption === 'projects_lowest') return getProjectCount(a.id) - getProjectCount(b.id);
    if (sortOption === 'a-z') {
      const nameA = a.firstName || a.companyName || '';
      const nameB = b.firstName || b.companyName || '';
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  return (
    <div className="space-y-6 pb-24">

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Directory</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl w-full xl:w-auto shadow-inner overflow-x-auto" role="group">
          {availableTabs.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 xl:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${roleFilter === role
                  ? 'bg-white shadow-sm text-primary border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              {role === 'Course Instructor' ? 'Instructor' : role}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Filter & Sort Directory</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input type="text" placeholder="Search name or email..." className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="relative">
            <GraduationCap className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)}>
              <option value="">All Majors</option>
              {uniqueMajors.map(major => <option key={major} value={major}>{major}</option>)}
            </select>
          </div>

          <div className="relative">
            <Code className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
              <option value="">All Skills</option>
              {uniqueSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-blue-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-blue-200 rounded-xl pl-10 pr-3 py-3 bg-blue-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-bold text-blue-800" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="projects_highest">Sort: Most Projects</option>
              <option value="projects_lowest">Sort: Fewest Projects</option>
              <option value="a-z">Sort: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {sortedUsers.length === 0 && !isLoading ? (
        <div className="bg-surface border border-dashed border-gray-300 rounded-3xl p-16 text-center text-gray-500">
          No users match your criteria.
          <button onClick={() => { setSearchTerm(''); setMajorFilter(''); setSkillFilter(''); setSortOption('projects_highest'); }} className="block mx-auto mt-3 text-sm text-blue-600 hover:underline font-bold">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <>
               {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <SkeletonCard key={num} />)}
            </>
          ) : (
            sortedUsers.map((user, index) => {
              const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === user.id && f.type === 'portfolio');
              const displayName = user.role === 'Employer' ? user.companyName : `${user.firstName} ${user.lastName}`;
              const hasSubInfo = user.major || user.address || (user.role === 'Course Instructor' && user.linkedCourses?.length > 0);
              const projectCount = getProjectCount(user.id);

              return (
                <TiltCard 
                  key={user.id} 
                  delay={index * 100}
                  className="glass-card bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md flex flex-col group relative"
                >

                  <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 relative">
                    {currentUser && currentUser.id !== user.id && (
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(currentUser.id, user.id, 'portfolio'); }}
                        className="animate-pop absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm transition-all hover:scale-110 z-20 group/btn"
                        title={isFav ? "Unlike Portfolio" : "Like Portfolio"}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/btn:text-red-400'}`} />
                      </button>
                    )}
                  </div>

                  <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                    <div className="flex justify-between items-end mb-3">
                      <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-50 shadow-sm overflow-hidden -mt-8 relative z-10">
                        <img src={user.profilePic} alt={`Profile picture of ${displayName}`} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 relative z-10">
                        {user.role === 'Course Instructor' ? 'Instructor' : user.role}
                      </span>
                    </div>

                    <Link to={`/portfolios/${user.id}`} className="relative z-10">
                      <h3 className="text-lg font-bold text-primary hover:text-blue-600 transition-colors">{displayName}</h3>
                    </Link>

                    {hasSubInfo && (
                      <p className="text-xs text-gray-500 font-medium mt-1 flex items-center line-clamp-1 relative z-10">
                        {user.role === 'Employer' ? <><MapPin aria-hidden="true" className="w-3 h-3 mr-1 shrink-0" /> {user.address}</> :
                          user.role === 'Course Instructor' ? <><BookOpen aria-hidden="true" className="w-3 h-3 mr-1 shrink-0" /> {user.linkedCourses?.join(', ')}</> : user.major}
                      </p>
                    )}

                    {(user.role === 'Student' || user.role === 'Course Instructor') && (
                      <div className="mt-3 flex items-center text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md relative z-10">
                        <Folder className="w-3 h-3 mr-1" /> {projectCount} Public Project{projectCount !== 1 && 's'}
                      </div>
                    )}

                    {user.role === 'Student' && user.skills && user.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
                        {user.skills.slice(0, 5).map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-[10px] font-bold">{skill}</span>
                        ))}
                        {user.skills.length > 5 && (
                          <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-md text-[10px] font-bold">+{user.skills.length - 5}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-5 relative z-10">
                      <Link to={`/portfolios/${user.id}`} className="flex items-center justify-center w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors border border-gray-200 group-hover:border-blue-200 group-hover:text-blue-700">
                        View Profile <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioList;