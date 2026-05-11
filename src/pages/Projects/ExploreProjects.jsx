// src/pages/Projects/ExploreProjects.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Filter, Folder, Star, BookOpen, User, ArrowUpDown, AlertTriangle, EyeOff, Heart } from 'lucide-react';

const ExploreProjects = () => {
  const { projects, courses, users, toggleFavorite, favorites } = useData();
  const { currentUser } = useAuth();
  const location = useLocation();

  // FIXED: Initialize with the global search query if it was passed via Topbar!
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [courseFilter, setCourseFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Listen for subsequent searches from the Topbar while already on this page
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      // Clear the history state so a page refresh doesn't trigger the search again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const instructors = users.filter(u => u.role === 'Course Instructor');
  const canSaveFavorites = currentUser?.role === 'Student' || currentUser?.role === 'Employer';

  const visibleProjects = projects.filter(p => {
    if (currentUser?.role === 'Administrator') return true;
    if (currentUser?.role === 'Course Instructor') {
      const course = courses.find(c => c.id === p.courseId);
      const teachesCourse = currentUser?.linkedCourses?.includes(course?.code);
      if (p.status === 'deactivated' && !teachesCourse) return false;
      return p.visibility === 'public' || teachesCourse;
    }
    return p.visibility === 'public' && p.status === 'active';
  });

  const filteredProjects = visibleProjects.filter(project => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (courseFilter && project.courseId !== courseFilter) return false;
    if (startDateFilter && project.creationDate < startDateFilter) return false;
    if (endDateFilter && project.creationDate > endDateFilter) return false;

    if (instructorFilter) {
      const instructor = users.find(u => u.id === parseInt(instructorFilter));
      if (instructor && instructor.linkedCourses) {
        const course = courses.find(c => c.id === project.courseId);
        if (!course || !instructor.linkedCourses.includes(course.code)) return false;
      } else {
        return false;
      }
    }
    return true;
  });

  const enhancedProjects = filteredProjects.map(project => {
    const ratings = project.ratings || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings) : 0;
    return { ...project, avgRating };
  });

  const sortedProjects = [...enhancedProjects].sort((a, b) => {
    // NEW: Use exact millisecond timestamp if it exists, otherwise fallback to date string
    const timeA = a.timestamp || new Date(a.creationDate).getTime();
    const timeB = b.timestamp || new Date(b.creationDate).getTime();

    if (sortOption === 'newest') return timeB - timeA;
    if (sortOption === 'oldest') return timeA - timeB;
    if (sortOption === 'highest-rated') return b.avgRating - a.avgRating;
    if (sortOption === 'lowest-rated') return a.avgRating - b.avgRating;
    return 0;
  });

  const getCourseName = (id) => courses.find(c => c.id === id)?.name;
  const getCreatorName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Explore Projects</h2>
        {currentUser?.role === 'Administrator' && (
          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full uppercase tracking-wider">Admin View: Showing All Projects</span>
        )}
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Filter & Sort Engine</h3>
          </div>
        </div>

        {/* FIXED UX: Changed from xl:grid-cols-6 (squished) to a spacious md:grid-cols-3 (3x2 grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Row 1 */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input type="text" placeholder="Search by title..." className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="relative">
            <BookOpen className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={instructorFilter} onChange={(e) => setInstructorFilter(e.target.value)}>
              <option value="">All Instructors</option>
              {instructors.map(inst => (<option key={inst.id} value={inst.id}>Prof. {inst.firstName} {inst.lastName}</option>))}
            </select>
          </div>

          {/* Row 2 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">From</span>
            <input type="date" className="w-full text-sm border border-gray-200 rounded-xl pl-14 pr-8 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary text-gray-600 cursor-pointer" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
            {startDateFilter && <button onClick={() => setStartDateFilter('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-red-500 font-bold hover:underline bg-gray-50 px-1 rounded">X</button>}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">To</span>
            <input type="date" className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-8 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary text-gray-600 cursor-pointer" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
            {endDateFilter && <button onClick={() => setEndDateFilter('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-red-500 font-bold hover:underline bg-gray-50 px-1 rounded">X</button>}
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-blue-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-blue-200 rounded-xl pl-10 pr-3 py-3 bg-blue-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-bold text-blue-800" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest-rated">Sort: Highest Rated</option>
              <option value="lowest-rated">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects.map(project => {
          const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === project.id && f.type === 'project');

          return (
            <div key={project.id} className={`glass-card bg-surface p-6 rounded-2xl shadow-sm border transition-all hover:-translate-y-1 flex flex-col h-full relative group ${project.status === 'deactivated' ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:shadow-md'}`}>

              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {canSaveFavorites && (
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite(currentUser.id, project.id, 'project'); }}
                    /* DELIGHTER: Added 'animate-pop' */
                    className="animate-pop p-2 bg-white rounded-full border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm transition-all hover:scale-110 z-20"
                    title={isFav ? "Remove from favorites" : "Save to favorites"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                )}
                {project.visibility === 'private' && (
                  <span className="flex items-center text-[10px] font-bold bg-gray-800 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-sm"><EyeOff className="w-3 h-3 mr-1" /> Private</span>
                )}
                {project.status === 'deactivated' && (
                  <span className="flex items-center text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-sm"><AlertTriangle className="w-3 h-3 mr-1" /> Deactivated</span>
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex items-center text-yellow-500 text-sm font-bold mt-2 mr-12">
                  <Star className="w-4 h-4 mr-1 fill-current" /> {project.avgRating > 0 ? project.avgRating.toFixed(1) : 0}/5
                </div>
              </div>

              <Link to={`/projects/${project.id}`}>
                <h3 className={`font-bold text-lg mb-1 hover:text-blue-600 transition-colors line-clamp-2 ${project.status === 'deactivated' ? 'text-red-800' : 'text-primary'}`}>{project.title}</h3>
              </Link>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">{getCourseName(project.courseId)}</p>

              <div className="flex flex-wrap gap-2 mb-4 flex-1">
                {project.languages?.slice(0, 3).map(lang => (
                  <span key={lang} className={`px-2 py-1 border rounded-md text-xs font-medium ${project.status === 'deactivated' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{lang}</span>
                ))}
              </div>

              <div className={`pt-4 border-t flex items-center justify-between mt-auto ${project.status === 'deactivated' ? 'border-red-100' : 'border-gray-100'}`}>
                <span className="text-xs text-gray-500 truncate max-w-[120px]">By {getCreatorName(project.creatorId)}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${project.status === 'deactivated' ? 'text-red-500 bg-red-100' : 'text-gray-400 bg-gray-50'}`}>{project.creationDate}</span>
              </div>
            </div>
          );
        })}

        {sortedProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-surface rounded-2xl border border-dashed border-gray-300">
            No projects match your current filters.
            <button onClick={() => { setSearchQuery(''); setCourseFilter(''); setInstructorFilter(''); setStartDateFilter(''); setEndDateFilter(''); setSortOption('newest'); }} className="block mx-auto mt-2 text-sm text-blue-600 hover:underline font-bold">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;