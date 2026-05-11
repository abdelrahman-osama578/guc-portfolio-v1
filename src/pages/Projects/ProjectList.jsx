// src/pages/Projects/ProjectList.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Plus, Folder, Code, Eye, EyeOff, Users, AlertTriangle, Heart, Search, Filter, BookOpen, ArrowUpDown } from 'lucide-react'; 
import CreateProjectForm from '../../components/projects/CreateProjectForm';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const { currentUser } = useAuth();
  const { projects, courses, updateProject, showToast, invitations, toggleFavorite, favorites } = useData(); 
  
  const [showCreateForm, setShowCreateForm] = useState(false);

  // --- FULL FILTER ENGINE STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState(''); 
  const [endDateFilter, setEndDateFilter] = useState('');     
  const [sortOption, setSortOption] = useState('newest'); 

  const canSaveFavorites = currentUser?.role === 'Student' || currentUser?.role === 'Employer';

  // 1. Get Base User Projects
  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => 
      inv.projectId === p.id && inv.receiverId === currentUser?.id && inv.status === 'accepted'
    );
    return isCreator || isCollaborator;
  });

  // 2. Apply Filters
  const filteredProjects = userProjects.filter(project => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && !project.languages?.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (courseFilter && project.courseId !== courseFilter) return false;
    if (visibilityFilter && project.visibility !== visibilityFilter) return false;
    if (startDateFilter && project.creationDate < startDateFilter) return false;
    if (endDateFilter && project.creationDate > endDateFilter) return false;
    return true;
  });

  // 3. Apply Sorting
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const timeA = a.timestamp || new Date(a.creationDate).getTime();
    const timeB = b.timestamp || new Date(b.creationDate).getTime();

    if (sortOption === 'newest') return timeB - timeA; 
    if (sortOption === 'oldest') return timeA - timeB; 
    if (sortOption === 'a-z') return a.title.localeCompare(b.title);
    if (sortOption === 'z-a') return b.title.localeCompare(a.title);
    return 0;
  });

  const getCourseName = (id) => courses.find(c => c.id === id)?.name || 'Unknown Course';

  const handleToggleVisibility = (project) => {
    if (project.creatorId !== currentUser?.id) {
       if (showToast) showToast("Only the project creator can change visibility.", "error");
       return;
    }
    const newVisibility = project.visibility === 'public' ? 'private' : 'public';
    updateProject(project.id, { visibility: newVisibility });
    if (showToast) {
      showToast(`Project is now ${newVisibility} on your portfolio!`, newVisibility === 'public' ? 'success' : 'info');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary flex items-center">My Projects</h2>
        
        {currentUser?.role === 'Student' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 flex items-center justify-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Project
          </button>
        )}
      </div>

      {showCreateForm && <CreateProjectForm onClose={() => setShowCreateForm(false)} />}

      {/* --- ADVANCED 3x2 FILTER GRID --- */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Filter & Sort Projects</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input type="text" placeholder="Search title or language..." className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="relative">
            <BookOpen className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          
          <div className="relative">
            <Eye className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
              <option value="">All Visibilities</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

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
              <option value="a-z">Sort: A to Z</option>
              <option value="z-a">Sort: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects.map(project => {
          const isCreator = project.creatorId === currentUser?.id;
          const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === project.id && f.type === 'project');
          
          return (
            <div key={project.id} className={`glass-card bg-surface p-6 rounded-2xl shadow-sm border transition-all flex flex-col h-full relative group ${project.status === 'deactivated' ? 'border-red-200 bg-red-50 hover:shadow-md' : 'border-gray-100 hover:shadow-md hover:-translate-y-1'}`}>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCreator ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} ${project.status === 'deactivated' ? 'opacity-50' : ''}`}>
                  {isCreator ? <Folder className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* FIXED: Moved Deactivated badge securely inside the flex container */}
                  {project.status === 'deactivated' && (
                    <span className="flex items-center text-[10px] font-bold bg-red-600 text-white px-2.5 py-1.5 rounded-md uppercase tracking-wider shadow-sm">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                    </span>
                  )}

                  {canSaveFavorites && (
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(currentUser.id, project.id, 'project'); }}
                      className="animate-pop p-1.5 bg-white rounded-full border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm transition-all z-20 relative"
                      title={isFav ? "Remove from favorites" : "Save to favorites"}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  )}

                  {isCreator ? (
                    <button 
                      onClick={() => handleToggleVisibility(project)}
                      title="Click to toggle portfolio visibility"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all hover:scale-105 shadow-sm border ${
                        project.visibility === 'public' 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {project.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {project.visibility}
                    </button>
                  ) : (
                    <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold uppercase shadow-sm border ${
                      project.visibility === 'public' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {project.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {project.visibility}
                    </span>
                  )}
                </div>
              </div>
              
              <Link to={`/projects/${project.id}`}>
                <h3 className={`font-bold text-lg mb-1 hover:text-blue-600 transition-colors cursor-pointer ${project.status === 'deactivated' ? 'text-red-800' : 'text-primary'}`}>
                  {project.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-4">{getCourseName(project.courseId)}</p>
              
              <div className="flex flex-wrap gap-2 mb-6 flex-1">
                {project.languages?.map(lang => (
                  <span key={lang} className={`px-2 py-1 border rounded-md text-xs font-medium ${project.status === 'deactivated' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    {lang}
                  </span>
                ))}
              </div>

              <div className={`pt-4 border-t flex items-center justify-between mt-auto ${project.status === 'deactivated' ? 'border-red-200' : 'border-gray-100'}`}>
                <span className={`text-xs font-medium px-2 py-1 rounded border ${project.status === 'deactivated' ? 'bg-red-100 border-red-200 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>{project.creationDate}</span>
                <div className="flex space-x-2">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">
                      <Code className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm">
                    <Eye className="w-3 h-3" /> Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
        {sortedProjects.length === 0 && !showCreateForm && (
          <div className="col-span-full py-16 text-center text-gray-500 bg-surface rounded-3xl border border-dashed border-gray-300">
            {searchQuery || courseFilter || visibilityFilter || startDateFilter || endDateFilter ? (
              <>
                <p className="font-bold text-gray-600">No projects match your current filters.</p>
                <button onClick={() => { setSearchQuery(''); setCourseFilter(''); setVisibilityFilter(''); setStartDateFilter(''); setEndDateFilter(''); setSortOption('newest'); }} className="mt-3 text-sm text-blue-600 hover:underline font-bold">Clear all filters</button>
              </>
            ) : (
              <p>You haven't created or joined any projects yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;