// src/pages/Portfolio/PortfolioList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, ArrowRight, BookOpen, ArrowUpDown, Folder, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioList = () => {
  const { users, projects, courses, toggleFavorite, favorites } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('Student');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('most-projects');

  const canSaveFavorites = currentUser?.role === 'Student' || currentUser?.role === 'Employer';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterOption('');
    setSortOption(tab === 'Student' ? 'most-projects' : 'name-asc');
  };

  const displayUsers = users.filter(u => u.role === activeTab);

  const getProjectCount = (userId) => {
    return projects.filter(p => p.creatorId === userId && p.visibility === 'public' && p.status !== 'deactivated').length;
  };

  const filteredUsers = displayUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    const hasSkillMatch = user.skills?.some(skill => skill.toLowerCase().includes(query));
    const matchesSearch = fullName.includes(query) || email.includes(query) || (activeTab === 'Student' && hasSkillMatch);

    let matchesFilter = true;
    if (filterOption) {
      if (activeTab === 'Student') {
        matchesFilter = user.major === filterOption;
      } else if (activeTab === 'Course Instructor') {
        matchesFilter = user.linkedCourses?.includes(filterOption);
      }
    }

    return matchesSearch && matchesFilter;
  });

  const enhancedUsers = filteredUsers.map(user => ({
    ...user,
    projectCount: activeTab === 'Student' ? getProjectCount(user.id) : 0
  }));

  const sortedUsers = [...enhancedUsers].sort((a, b) => {
    if (sortOption === 'most-projects') return b.projectCount - a.projectCount;
    if (sortOption === 'fewest-projects') return a.projectCount - b.projectCount;
    if (sortOption === 'name-asc') return a.firstName.localeCompare(b.firstName);
    if (sortOption === 'name-desc') return b.firstName.localeCompare(a.firstName);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">University Directory</h2>

        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => handleTabSwitch('Student')}
            className={`flex-1 md:w-32 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'Student' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Students
          </button>
          <button
            onClick={() => handleTabSwitch('Course Instructor')}
            className={`flex-1 md:w-32 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'Course Instructor' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Instructors
          </button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input type="text" placeholder={activeTab === 'Student' ? "Search by name, email, or skill..." : "Search by name or email..."} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="relative">
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white appearance-none cursor-pointer" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            {activeTab === 'Student' ? (
              <><option value="">All Majors</option><option value="MET">MET</option><option value="IET">IET</option><option value="BI">BI</option></>
            ) : (
              <><option value="">All Courses</option>{courses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}</>
            )}
          </select>
        </div>

        <div className="relative">
          <ArrowUpDown className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select className="pl-10 pr-4 py-2 w-full border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-blue-50 text-blue-800 font-medium appearance-none cursor-pointer" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            {activeTab === 'Student' && (
              <><option value="most-projects">Sort: Most Projects</option><option value="fewest-projects">Sort: Fewest Projects</option></>
            )}
            <option value="name-asc">Sort: Name (A to Z)</option>
            <option value="name-desc">Sort: Name (Z to A)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedUsers.map(user => {
          const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === user.id && f.type === 'portfolio');

          return (
            <div key={user.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center relative">

              {/* REQ 65: Favorite Toggle Button for Portfolios */}
              {canSaveFavorites && user.id !== currentUser?.id && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite(currentUser.id, user.id, 'portfolio'); }}
                    className="p-2 bg-gray-50 rounded-full border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm transition-all hover:scale-110"
                    title={isFav ? "Remove from favorites" : "Save to favorites"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
              )}

              <img src={user.profilePic} alt="Profile" className="w-20 h-20 rounded-full mb-4 border-2 border-gray-50 shadow-sm object-cover" />

              <Link to={`/portfolios/${user.id}`}>
                <h3 className="text-lg font-bold text-primary hover:text-blue-600 transition-colors">
                  {user.firstName} {user.lastName}
                </h3>
              </Link>

              {activeTab === 'Student' ? (
                <p className="text-sm text-gray-500 mb-2 mt-1">{user.major || 'No Major Set'}</p>
              ) : (
                <p className="text-sm text-purple-600 mb-2 mt-1 font-medium">Instructor</p>
              )}

              <div className="flex gap-2 mb-4 justify-center flex-wrap h-14 overflow-hidden">
                {activeTab === 'Student' ? (
                  user.skills?.slice(0, 3).map(skill => <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs border border-gray-200">{skill}</span>)
                ) : (
                  user.linkedCourses?.map(course => <span key={course} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {course}</span>)
                )}
              </div>

              <div className="mt-auto w-full pt-4 border-t border-gray-100 flex items-center justify-between">
                {activeTab === 'Student' ? (
                  <span className="flex items-center text-sm text-gray-500 font-medium">
                    <Folder className="w-4 h-4 mr-1.5 text-blue-500" />
                    {user.projectCount} Public Projects
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">View Teaching Profile</span>
                )}

                <Link to={`/portfolios/${user.id}`} className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  View <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )
        })}
        {sortedUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No {activeTab === 'Student' ? 'students' : 'instructors'} found matching your search.
            <button onClick={() => { setSearchQuery(''); setFilterOption(''); }} className="block mx-auto mt-2 text-sm text-blue-600 hover:underline font-bold">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioList;