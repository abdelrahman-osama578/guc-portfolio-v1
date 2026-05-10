// src/pages/Projects/ProjectList.jsx
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Plus, Folder, Code, Eye, EyeOff, Users, AlertTriangle, Heart } from 'lucide-react'; 
import CreateProjectForm from '../../components/projects/CreateProjectForm';

const ProjectList = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { projects, courses, updateProject, showToast, invitations, toggleFavorite, favorites } = useData(); 
  
  // Tab State (Controlled via Sidebar navigation now)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'my_projects');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Listen for navigation state changes from the Sidebar or Dashboard
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else {
      // If no state is passed (e.g. clicking "My Projects" in sidebar), default back to my_projects
      setActiveTab('my_projects');
    }
  }, [location.state, location.pathname]);

  const canSaveFavorites = currentUser?.role === 'Student' || currentUser?.role === 'Employer';

  // --- FILTER 1: My Projects ---
  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => 
      inv.projectId === p.id && 
      inv.receiverId === currentUser?.id && 
      inv.status === 'accepted'
    );
    return isCreator || isCollaborator;
  });

  // --- FILTER 2: Explore (All Public Projects) ---
  const exploreProjects = projects.filter(p => p.visibility === 'public' && p.status === 'active');

  // Determine which list to show based on the active tab
  const displayedProjects = activeTab === 'my_projects' ? userProjects : exploreProjects;

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
        <h2 className="text-2xl font-bold text-primary flex items-center">
          {activeTab === 'my_projects' ? 'My Projects' : 'Explore Projects'}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Create Button (Only visible on My Projects for Students) */}
          {currentUser?.role === 'Student' && activeTab === 'my_projects' && (
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 flex items-center justify-center transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </button>
          )}
        </div>
      </div>

      {showCreateForm && activeTab === 'my_projects' && <CreateProjectForm onClose={() => setShowCreateForm(false)} />}

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedProjects.map(project => {
          const isCreator = project.creatorId === currentUser?.id;
          const isFav = favorites.some(f => f.userId === currentUser?.id && f.itemId === project.id && f.type === 'project');

          return (
            <div key={project.id} className={`bg-surface p-6 rounded-2xl shadow-sm border transition-shadow flex flex-col h-full relative group ${project.status === 'deactivated' ? 'border-red-200 bg-red-50 hover:shadow-md' : 'border-gray-100 hover:shadow-md'}`}>
              
              {project.status === 'deactivated' && (
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center z-10">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Deactivated (Flagged)
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCreator ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} ${project.status === 'deactivated' ? 'opacity-50' : ''}`}>
                  {isCreator ? <Folder className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                
                <div className="flex items-center gap-2">
                  {canSaveFavorites && (
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(currentUser.id, project.id, 'project'); }}
                      className="p-1.5 bg-white rounded-full border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm transition-all hover:scale-110 z-10"
                      title={isFav ? "Remove from favorites" : "Save to favorites"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
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
        
        {displayedProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 bg-surface rounded-3xl border border-dashed border-gray-300">
            {activeTab === 'my_projects' ? "You don't have any projects yet." : "No public projects to explore."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;