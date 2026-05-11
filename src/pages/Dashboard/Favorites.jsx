// src/pages/Dashboard/Favorites.jsx
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, Folder, User, ArrowRight } from 'lucide-react';
import TiltCard from '../../components/common/TiltCard'; // <-- IMPORTED TILTCARD

const Favorites = () => {
  const { favorites, projects, users, toggleFavorite } = useData();
  const { currentUser } = useAuth();

  const myFavorites = favorites.filter(f => f.userId === currentUser?.id);
  
  const favProjects = myFavorites
    .filter(f => f.type === 'project')
    .map(f => projects.find(p => p.id === f.itemId))
    .filter(Boolean); 
    
  const favPortfolios = myFavorites
    .filter(f => f.type === 'portfolio')
    .map(f => users.find(u => u.id === f.itemId))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" /> My Favorites
      </h2>

      {/* Favorite Projects */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Folder className="w-5 h-5 mr-2" /> Saved Projects</h3>
        {favProjects.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite projects yet. Explore projects and click the heart icon to save them here!</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FIXED: Added index to map and wrapped in TiltCard */}
            {favProjects.map((proj, index) => (
              <TiltCard key={proj.id} delay={index * 100} className="glass-card bg-surface p-4 rounded-xl border border-gray-100 flex flex-col justify-between hover:shadow-sm transition-all hover:-translate-y-1 h-full group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <Link to={`/projects/${proj.id}`} className="font-bold text-lg text-primary hover:text-blue-600 line-clamp-2 pr-4">{proj.title}</Link>
                  <button onClick={() => toggleFavorite(currentUser.id, proj.id, 'project')} className="animate-pop text-red-500 hover:scale-110 transition-transform p-1.5 bg-red-50 rounded-full shrink-0 shadow-sm">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="pt-3 mt-auto flex justify-between items-center border-t border-gray-50 relative z-10">
                  <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${proj.status === 'deactivated' ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {proj.status}
                  </span>
                  <Link to={`/projects/${proj.id}`} className="text-xs font-bold text-blue-600 flex items-center hover:underline">View <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Portfolios */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Saved Portfolios</h3>
        {favPortfolios.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite portfolios yet. Browse the directory to save your favorite students and instructors!</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FIXED: Added index to map and wrapped in TiltCard */}
            {favPortfolios.map((user, index) => (
              <TiltCard key={user.id} delay={index * 100} className="glass-card bg-surface p-4 rounded-xl border border-gray-100 flex flex-col hover:shadow-sm transition-all hover:-translate-y-1 h-full group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                    <div>
                      <Link to={`/portfolios/${user.id}`} className="font-bold text-primary hover:text-blue-600">{user.firstName} {user.lastName}</Link>
                      <p className="text-xs text-gray-500">{user.major || user.role}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(currentUser.id, user.id, 'portfolio')} className="animate-pop text-red-500 hover:scale-110 transition-transform p-1.5 bg-red-50 rounded-full shrink-0 shadow-sm">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="pt-3 mt-auto flex justify-end border-t border-gray-50 relative z-10">
                  <Link to={`/portfolios/${user.id}`} className="text-xs font-bold text-blue-600 flex items-center hover:underline">View Profile <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;