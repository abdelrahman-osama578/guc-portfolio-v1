// src/pages/Dashboard/DashboardHome.jsx
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Folder, Users, Code, ArrowUpRight, Star, Briefcase, BarChart3, BookOpen, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const { projects, courses, invitations, internships, applications, users } = useData();

  // STUDENT METRICS
  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => inv.projectId === p.id && inv.receiverId === currentUser?.id && inv.status === 'accepted');
    return isCreator || isCollaborator;
  });

  const activeCollaborations = invitations?.filter(inv => (inv.senderId === currentUser?.id || inv.receiverId === currentUser?.id) && inv.status === 'accepted').length || 0;

  // REQ 89+: Get student's applications for the dashboard tracker
  const myApplications = applications.filter(app => app.studentId === currentUser?.id);

  const getLanguageStats = () => {
    const allLanguages = userProjects.flatMap(p => p.languages || []);
    if (allLanguages.length === 0) return { top: 'None', breakdown: [] };
    const counts = allLanguages.reduce((acc, lang) => { acc[lang] = (acc[lang] || 0) + 1; return acc; }, {});
    const total = allLanguages.length;
    const breakdown = Object.entries(counts).map(([lang, count]) => ({ lang, perc: Math.round((count / total) * 100) })).sort((a, b) => b.perc - a.perc);
    return { top: breakdown[0]?.lang || 'None', breakdown };
  };
  const languageStats = getLanguageStats();

  const getTopCollaborators = () => {
    const collabIds = invitations.filter(inv => inv.status === 'accepted' && (inv.senderId === currentUser?.id || inv.receiverId === currentUser?.id)).map(inv => inv.senderId === currentUser?.id ? inv.receiverId : inv.senderId);
    const collabCounts = collabIds.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
    return Object.entries(collabCounts).map(([id, count]) => ({ user: users.find(u => u.id === parseInt(id)), count })).filter(c => c.user).sort((a,b) => b.count - a.count).slice(0, 3);
  };
  const topCollaborators = getTopCollaborators();

  // EMPLOYER & ADMIN METRICS
  const isEmployer = currentUser?.role === 'Employer';
  const isAdmin = currentUser?.role === 'Administrator';

  const targetInternships = isEmployer ? internships.filter(i => i.companyName === currentUser?.companyName) : internships;
  const totalOffered = targetInternships.length;
  const totalHiredStudents = applications.filter(app => app.status === 'accepted' && targetInternships.some(i => i.id === app.internshipId)).length;

  const internshipsOverTime = targetInternships.reduce((acc, int) => {
     try {
       const date = new Date(int.postedDate);
       const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
       if (monthYear !== 'Invalid Date') { acc[monthYear] = (acc[monthYear] || 0) + 1; }
     } catch(e) {}
     return acc;
  }, {});
  
  const chartLabels = Object.keys(internshipsOverTime).sort((a, b) => new Date(a) - new Date(b));
  const maxChartValue = Math.max(...Object.values(internshipsOverTime), 1);
  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  return (
    <div className="space-y-6">
      
      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentUser?.role === 'Student' && (
          <>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Projects</p><h3 className="text-3xl font-bold text-primary">{userProjects.length}</h3></div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Folder className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Collaborations</p><h3 className="text-3xl font-bold text-primary">{activeCollaborations}</h3></div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Top Language</p><h3 className="text-2xl font-bold text-primary truncate max-w-[120px]">{languageStats.top}</h3></div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Code className="w-6 h-6" /></div>
            </div>
          </>
        )}

        {isEmployer && (
          <>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Internships Offered</p><h3 className="text-3xl font-bold text-primary">{totalOffered}</h3></div>
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Students Hired</p><h3 className="text-3xl font-bold text-primary">{totalHiredStudents}</h3></div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Award className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Total Applications</p><h3 className="text-3xl font-bold text-primary">{applications.filter(a => targetInternships.some(i => i.id === a.internshipId)).length}</h3></div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Platform Users</p><h3 className="text-3xl font-bold text-primary">{users.length}</h3></div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Total Projects</p><h3 className="text-3xl font-bold text-primary">{projects.length}</h3></div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Folder className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Total Courses</p><h3 className="text-3xl font-bold text-primary">{courses.length}</h3></div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
            </div>
          </>
        )}

        {currentUser?.role === 'Course Instructor' && (
           <>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Linked Courses</p><h3 className="text-3xl font-bold text-primary">{currentUser?.linkedCourses?.length || 0}</h3></div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Platform Projects</p><h3 className="text-3xl font-bold text-primary">{projects.length}</h3></div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Folder className="w-6 h-6" /></div>
            </div>
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-yellow-100 flex items-center justify-between">
              <div><p className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-1">Pending Invites</p><h3 className="text-3xl font-bold text-primary">{invitations.filter(i => i.receiverId === currentUser.id && i.status === 'pending' && !i.type).length}</h3></div>
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center"><Star className="w-6 h-6" /></div>
            </div>
           </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {currentUser?.role === 'Student' && (
            <>
              {/* --- NEW: MY APPLICATIONS TRACKER --- */}
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" /> My Applications
                  </h3>
                  <Link to="/internships" className="text-sm font-bold text-blue-600 hover:underline flex items-center">
                    Explore Internships <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {myApplications.length > 0 ? (
                    myApplications.map(app => {
                      const internship = internships.find(i => i.id === app.internshipId);
                      if (!internship) return null;
                      
                      return (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary text-sm leading-tight">{internship.title}</h4>
                              <p className="text-xs font-bold text-gray-500 mt-0.5">{internship.companyName}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border 
                            ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                            ${app.status === 'nominated' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                            ${app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                            ${app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                          `}>
                            {app.status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6 border border-dashed rounded-2xl">You haven't applied to any internships yet.</p>
                  )}
                </div>
              </div>

              {/* RECENT PROJECTS */}
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary">Recent Projects</h3>
                  <Link to="/projects" className="text-sm font-bold text-blue-600 hover:underline flex items-center">
                    View all <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {userProjects.length > 0 ? (
                    userProjects.slice(-3).reverse().map(project => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.creatorId === currentUser?.id ? 'bg-white shadow-sm text-gray-500' : 'bg-purple-100 text-purple-600'}`}>
                            {project.creatorId === currentUser?.id ? <Folder className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                          </div>
                          <div>
                            <Link to={`/projects/${project.id}`}>
                              <h4 className="font-bold text-primary hover:text-blue-600 transition-colors text-lg leading-tight">{project.title}</h4>
                            </Link>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{project.creationDate}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${project.visibility === 'public' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                          {project.visibility}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-2xl">No projects yet. Start building!</p>
                  )}
                </div>
              </div>
            </>
          )}

          {isAdmin && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" /> Platform Usage & Demographics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Students</p>
                    <p className="text-2xl font-bold text-primary">{getRoleCount('Student')}</p>
                 </div>
                 <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Instructors</p>
                    <p className="text-2xl font-bold text-purple-900">{getRoleCount('Course Instructor')}</p>
                 </div>
                 <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Employers</p>
                    <p className="text-2xl font-bold text-orange-900">{getRoleCount('Employer')}</p>
                 </div>
                 <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Admins</p>
                    <p className="text-2xl font-bold text-red-900">{getRoleCount('Administrator')}</p>
                 </div>
              </div>
            </div>
          )}

          {(isEmployer || isAdmin) && (
             <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> 
                    {isEmployer ? 'My Internships Over Time' : 'Global Internships Over Time'}
                  </h3>
               </div>
               <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                 <div className="flex items-end gap-2 h-40">
                   {chartLabels.length === 0 ? (
                     <p className="text-sm text-gray-500 w-full text-center pb-4 italic">No internship data available over time.</p>
                   ) : (
                     chartLabels.map(label => {
                       const count = internshipsOverTime[label];
                       const heightPerc = (count / maxChartValue) * 100;
                       return (
                         <div key={label} className="flex flex-col items-center flex-1 h-full justify-end group">
                           <div className="w-full max-w-[40px] bg-orange-100 rounded-t-md relative flex items-end justify-center h-full">
                             <div className="w-full bg-orange-500 rounded-t-md transition-all duration-500 ease-out" style={{ height: `${heightPerc}%` }}></div>
                             <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10">
                               {count} Offered
                             </div>
                           </div>
                           <span className="text-[10px] font-bold text-gray-500 mt-3 truncate w-full text-center">{label}</span>
                         </div>
                       )
                     })
                   )}
                 </div>
               </div>
             </div>
          )}
          
          {currentUser?.role === 'Course Instructor' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                <Folder className="w-5 h-5 text-purple-600 mr-2" /> Projects in Your Courses
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {projects
                  .filter(p => currentUser.linkedCourses?.includes(courses.find(c => c.id === p.courseId)?.code))
                  .map(proj => (
                    <Link key={proj.id} to={`/projects/${proj.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-primary hover:text-purple-700 line-clamp-1">{proj.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ml-2 ${proj.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{proj.visibility}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 font-medium">{courses.find(c => c.id === proj.courseId)?.code}</span>
                        <span className="text-xs font-bold text-yellow-500 flex items-center"><Star className="w-3 h-3 mr-1 fill-current"/> {proj.rating || 0}/5</span>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="relative pt-12 flex flex-col items-center text-center">
              <img src={currentUser?.profilePic} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 object-cover bg-white" />
              <h4 className="font-bold text-xl">{currentUser?.firstName || currentUser?.companyName} {currentUser?.lastName}</h4>
              <p className="text-gray-500 text-sm font-medium mb-4">{currentUser?.major || currentUser?.role}</p>
              
              <div className="w-full mt-4">
                <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-left mb-2 border-b border-gray-100 pb-2">Skills</h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentUser?.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-md text-xs font-medium">{skill}</span>
                  ))}
                  {(!currentUser?.skills || currentUser?.skills?.length === 0) && <p className="text-xs text-gray-400 italic">No skills added yet.</p>}
                </div>
              </div>
            </div>
          </div>

          {currentUser?.role === 'Student' && (
            <>
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary mb-5 flex items-center"><Code className="w-5 h-5 mr-2 text-blue-500" /> Language Breakdown</h3>
                <div className="space-y-4">
                  {languageStats.breakdown.length === 0 ? <p className="text-xs text-gray-500 italic">No languages logged in projects.</p> : (
                    languageStats.breakdown.map((stat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1.5"><span className="font-bold text-gray-700">{stat.lang}</span><span className="text-gray-500 font-bold">{stat.perc}%</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stat.perc}%` }}></div></div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-yellow-500" /> Top Collaborators</h3>
                <div className="space-y-2">
                  {topCollaborators.length > 0 ? (
                    topCollaborators.map(c => (
                      <div key={c.user.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={c.user.profilePic} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                          <p className="text-sm font-bold text-primary">{c.user.firstName}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md uppercase tracking-wider">
                          {c.count} Proj{c.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))
                  ) : <p className="text-xs text-gray-400 italic text-center py-4 border border-dashed rounded-xl">No collaborations yet.</p>}
                </div>
              </div>
            </>
          )}

          {['Student', 'Employer', 'Course Instructor'].includes(currentUser?.role) && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" /> Recommended</h3>
              <div className="space-y-3">
                {projects
                  .filter(p => p.visibility === 'public' && p.creatorId !== currentUser.id && p.status === 'active')
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
                  .map(proj => (
                    <Link key={proj.id} to={`/projects/${proj.id}`} className="block p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <h4 className="font-bold text-sm text-primary hover:text-blue-600 line-clamp-1">{proj.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Rating: {proj.rating > 0 ? proj.rating.toFixed(1) : 0}/5</p>
                    </Link>
                  ))
                }
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;