// src/pages/Dashboard/DashboardHome.jsx
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Folder, Users, Code, ArrowUpRight, Star, Briefcase, BarChart3, BookOpen, ShieldAlert, Award, TrendingUp, ChevronRight, Activity, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltCard from '../../components/common/TiltCard';

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const { projects, courses, invitations, internships, applications, users } = useData();

  if (!currentUser) return null;

  const getRoleGradient = (role) => {
    switch (role) {
      case 'Administrator': return 'bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900';
      case 'Employer': return 'bg-gradient-to-br from-blue-900 to-indigo-900';
      case 'Course Instructor': return 'bg-gradient-to-br from-teal-800 to-emerald-900';
      default: return 'bg-gradient-to-br from-blue-700 to-cyan-600'; 
    }
  };

  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => inv.projectId === p.id && inv.receiverId === currentUser?.id && inv.status === 'accepted');
    return isCreator || isCollaborator;
  });

  const activeCollaborations = invitations?.filter(inv => (inv.senderId === currentUser?.id || inv.receiverId === currentUser?.id) && inv.status === 'accepted').length || 0;
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
    return Object.entries(collabCounts).map(([id, count]) => ({ user: users.find(u => u.id === parseInt(id)), count })).filter(c => c.user).sort((a, b) => b.count - a.count).slice(0, 4);
  };
  const topCollaborators = getTopCollaborators();

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
    } catch (e) { }
    return acc;
  }, {});

  const chartLabels = Object.keys(internshipsOverTime).sort((a, b) => new Date(a) - new Date(b));
  const maxChartValue = Math.max(...Object.values(internshipsOverTime), 1);
  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  const recommendedProjects = projects
    .filter(p => p.visibility === 'public' && p.creatorId !== currentUser.id && p.status === 'active')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

  return (
    <div className="space-y-6 pb-24"> {/* Ghost Scrollbar fix */}

      <div className={`grid grid-cols-1 md:grid-cols-3 ${isAdmin ? 'xl:grid-cols-5' : ''} gap-6`}>
        {currentUser?.role === 'Student' && (
          <>
            <TiltCard delay={0} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">01</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Projects</p><h3 className="text-3xl font-bold text-primary">{userProjects.length}</h3></div>
              <Folder className="w-8 h-8 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={100} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">02</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Collaborations</p><h3 className="text-3xl font-bold text-primary">{activeCollaborations}</h3></div>
              <Users className="w-8 h-8 text-green-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={200} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">03</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Top Language</p><h3 className="text-2xl font-bold text-primary truncate max-w-[120px]">{languageStats.top}</h3></div>
              <Code className="w-8 h-8 text-purple-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
          </>
        )}

        {isEmployer && (
          <>
            <TiltCard delay={0} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-orange-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">01</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internships</p><h3 className="text-3xl font-bold text-primary">{totalOffered}</h3></div>
              <Briefcase className="w-8 h-8 text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={100} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">02</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hired</p><h3 className="text-3xl font-bold text-primary">{totalHiredStudents}</h3></div>
              <Award className="w-8 h-8 text-green-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={200} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors group relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">03</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applications</p><h3 className="text-3xl font-bold text-primary">{applications.filter(a => targetInternships.some(i => i.id === a.internshipId)).length}</h3></div>
              <BarChart3 className="w-8 h-8 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
          </>
        )}

        {isAdmin && (
          <>
            <TiltCard delay={0} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
              <div className="relative z-10"><p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Users</p><h3 className="text-2xl md:text-3xl font-bold text-primary">{users.length}</h3></div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={100} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-200 transition-colors">
              <div className="relative z-10"><p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Projects</p><h3 className="text-2xl md:text-3xl font-bold text-primary">{projects.length}</h3></div>
              <Folder className="w-6 h-6 md:w-8 md:h-8 text-purple-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={200} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-colors">
              <div className="relative z-10"><p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Courses</p><h3 className="text-2xl md:text-3xl font-bold text-primary">{courses.length}</h3></div>
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-green-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={300} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-colors">
              <div className="relative z-10"><p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internships</p><h3 className="text-2xl md:text-3xl font-bold text-primary">{totalOffered}</h3></div>
              <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={400} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-yellow-200 transition-colors">
              <div className="relative z-10"><p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hired</p><h3 className="text-2xl md:text-3xl font-bold text-primary">{totalHiredStudents}</h3></div>
              <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
          </>
        )}

        {currentUser?.role === 'Course Instructor' && (
          <>
            <TiltCard delay={0} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-200 transition-colors relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">01</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Courses</p><h3 className="text-3xl font-bold text-primary">{currentUser?.linkedCourses?.length || 0}</h3></div>
              <BookOpen className="w-8 h-8 text-purple-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={100} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">02</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Projects</p><h3 className="text-3xl font-bold text-primary">{projects.length}</h3></div>
              <Folder className="w-8 h-8 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
            <TiltCard delay={200} className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-yellow-200 transition-colors relative overflow-hidden">
              <span className="absolute -right-2 -bottom-6 text-8xl font-black text-gray-50 opacity-60 pointer-events-none select-none z-0 tracking-tighter">03</span>
              <div className="relative z-10"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invites</p><h3 className="text-3xl font-bold text-primary">{invitations.filter(i => i.receiverId === currentUser.id && i.status === 'pending' && !i.type).length}</h3></div>
              <Star className="w-8 h-8 text-yellow-500 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
            </TiltCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 flex flex-col">

          {currentUser?.role === 'Student' && (
            <>
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center"><Briefcase className="w-5 h-5 mr-2 text-blue-600" /> My Applications</h3>
                  <Link to="/internships" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center">
                    Explore Internships <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                  {myApplications.length > 0 ? (
                    myApplications.map((app, index) => {
                      const internship = internships.find(i => i.id === app.internshipId);
                      if (!internship) return null;
                      return (
                        <TiltCard delay={index * 100} key={app.id}>
                          <Link to="/internships" className="glass-card min-w-[280px] p-5 border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 transition-all bg-gray-50 hover:bg-white snap-start flex flex-col justify-between group cursor-pointer block h-full">
                            <div className="relative z-10">
                              <h4 className="font-bold text-primary text-sm truncate group-hover:text-blue-600 transition-colors">{internship.title}</h4>
                              <p className="text-xs font-bold text-blue-600 mt-1">{internship.companyName}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center relative z-10">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border 
                                 ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                 ${app.status === 'nominated' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                                 ${app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                 ${app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                               `}>{app.status}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" />
                            </div>
                          </Link>
                        </TiltCard>
                      );
                    })
                  ) : <p className="text-sm text-gray-500 text-center py-6 w-full border border-dashed rounded-xl">You haven't applied to any internships yet.</p>}
                </div>
              </div>

              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center"><Folder className="w-5 h-5 mr-2 text-blue-600" /> Recent Projects</h3>
                  <Link to="/projects" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center">View all <ArrowUpRight className="w-4 h-4 ml-1" /></Link>
                </div>

                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                  {userProjects.length > 0 ? (
                    userProjects.slice().reverse().map((project, index) => (
                      <TiltCard delay={index * 50} key={project.id}>
                        <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 hover:border-blue-100">
                          <div className="flex items-center space-x-4">
                            <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                              {project.creatorId === currentUser?.id ? <Folder className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                            </div>
                            <div>
                              <Link to={`/projects/${project.id}`}><h4 className="font-bold text-primary hover:text-blue-600 transition-colors text-sm">{project.title}</h4></Link>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{project.creationDate}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${project.visibility === 'public' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {project.visibility}
                          </span>
                        </div>
                      </TiltCard>
                    ))
                  ) : <p className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-xl">No projects yet. Start building!</p>}
                </div>
              </div>
            </>
          )}

          {isEmployer && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center"><Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Active Job Postings</h3>
                <Link to="/manage-applicants" className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-all">View all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {targetInternships.slice(0, 3).length > 0 ? targetInternships.slice(0, 3).map((internship, index) => (
                  <TiltCard delay={index * 100} key={internship.id}>
                    <div className="glass-card min-w-[280px] p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50 snap-start block h-full overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="font-bold text-primary text-sm truncate">{internship.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center"><Activity className="w-3 h-3 mr-1" /> Deadline: {internship.deadline}</p>
                        <Link to="/manage-applicants" className="mt-4 text-xs font-bold text-blue-600 hover:underline flex items-center">
                          Manage Applicants <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                )) : <p className="text-sm text-gray-500 italic py-4">No active job postings.</p>}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-blue-600" /> Platform Demographics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TiltCard delay={0} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center"><p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Students</p><p className="text-2xl font-bold text-primary">{getRoleCount('Student')}</p></TiltCard>
                <TiltCard delay={100} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center"><p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Instructors</p><p className="text-2xl font-bold text-primary">{getRoleCount('Course Instructor')}</p></TiltCard>
                <TiltCard delay={200} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center"><p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Employers</p><p className="text-2xl font-bold text-primary">{getRoleCount('Employer')}</p></TiltCard>
                <TiltCard delay={300} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center"><p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Admins</p><p className="text-2xl font-bold text-primary">{getRoleCount('Administrator')}</p></TiltCard>
              </div>
            </div>
          )}

          {(isEmployer || isAdmin) && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-bold text-primary flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> {isEmployer ? 'My Internships Over Time' : 'Global Internships Over Time'}
                </h3>
                {isAdmin && (
                  <div className="flex gap-2">
                    <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded border border-orange-100 flex items-center uppercase tracking-wider">
                      <Briefcase className="w-3 h-3 mr-1.5" /> {totalOffered} Offered
                    </span>
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1.5 rounded border border-green-100 flex items-center uppercase tracking-wider">
                      <Award className="w-3 h-3 mr-1.5" /> {totalHiredStudents} Hired
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 h-48 flex items-end gap-2">
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
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10">{count} Offered</div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 mt-3 truncate w-full text-center">{label}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {currentUser?.role === 'Course Instructor' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center"><Folder className="w-5 h-5 text-purple-600 mr-2" /> Projects in Your Courses</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {projects.filter(p => currentUser.linkedCourses?.includes(courses.find(c => c.id === p.courseId)?.code)).length > 0 ?
                  projects.filter(p => currentUser.linkedCourses?.includes(courses.find(c => c.id === p.courseId)?.code)).map((proj, index) => (
                    <TiltCard delay={index * 50} key={proj.id}>
                      <Link to={`/projects/${proj.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-primary hover:text-purple-700 line-clamp-1">{proj.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ml-2 ${proj.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{proj.visibility}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 font-medium">{courses.find(c => c.id === proj.courseId)?.code}</span>
                          <span className="text-xs font-bold text-yellow-500 flex items-center"><Star className="w-3 h-3 mr-1 fill-current" /> {proj.rating || 0}/5</span>
                        </div>
                      </Link>
                    </TiltCard>
                  )) : <p className="text-sm text-gray-500 italic py-4">No projects submitted to your courses yet.</p>}
              </div>
            </div>
          )}

          {['Student', 'Employer', 'Course Instructor'].includes(currentUser?.role) && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center"><Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" /> Recommended Projects</h3>
                <Link to="/explore" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center">View all</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedProjects.length > 0 ? recommendedProjects.map((proj, index) => {
                  const creator = users.find(u => u.id === proj.creatorId);
                  return (
                    <TiltCard delay={index * 100} key={proj.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3 relative z-10">
                        <img src={creator?.profilePic} alt="" className="w-6 h-6 rounded-full" />
                        <p className="text-xs font-bold text-gray-600 truncate">{creator?.firstName} {creator?.lastName}</p>
                      </div>
                      <h4 className="font-bold text-primary text-sm line-clamp-2 mb-4 flex-1 relative z-10">{proj.title}</h4>
                      <Link to={`/projects/${proj.id}`} className="block text-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 py-2 rounded-lg transition-colors relative z-10">
                        View Details
                      </Link>
                    </TiltCard>
                  );
                }) : <p className="text-sm text-gray-500 italic col-span-3">No public projects available to recommend.</p>}
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-6">

          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`h-24 ${getRoleGradient(currentUser.role)} relative`}>
              <span className="absolute top-3 right-4 text-white/50 font-black tracking-widest italic text-sm">GUC</span>
            </div>
            <div className="px-6 pb-6 relative text-center">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden mx-auto -mt-10 relative z-10">
                <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-primary mt-2">
                {currentUser.role === 'Employer' ? currentUser.companyName : `${currentUser.firstName} ${currentUser.lastName}`}
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{currentUser.role}</p>

              <div className="mt-5">
                <Link to={`/portfolios/${currentUser.id}`} className="block w-full text-center py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                  My Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center uppercase tracking-wider">
              <Code className="w-4 h-4 mr-2 text-blue-500" /> Core Profile
            </h3>

            {currentUser.skills && currentUser.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {currentUser.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic mb-6">No skills added yet.</p>
            )}

            {(currentUser.role === 'Student' || currentUser.role === 'Course Instructor') && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 border-t border-gray-100 pt-4">Language Breakdown</h4>
                <div className="space-y-3">
                  {languageStats.breakdown.length === 0 ? <p className="text-xs text-gray-500 italic">No languages logged.</p> : (
                    languageStats.breakdown.slice(0, 5).map((stat, idx) => {
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-yellow-500'];
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1.5"><span className="font-bold text-gray-700">{stat.lang}</span><span className="text-gray-500 font-bold">{stat.perc}%</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`${colors[idx % colors.length]} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${stat.perc}%` }}></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {currentUser.role === 'Employer' && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {currentUser.address || 'Location not set'}</p>
              </div>
            )}
          </div>

          {(currentUser?.role === 'Student' || currentUser?.role === 'Course Instructor') && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center uppercase tracking-wider">
                  <Users className="w-4 h-4 mr-2 text-blue-500" /> Network
                </h3>
                <Link to="/portfolios" className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-all">Directory</Link>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
                {topCollaborators.length > 0 ? topCollaborators.map((c, index) => (
                  <TiltCard delay={index * 50} key={c.user.id}>
                    <Link to={`/portfolios/${c.user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200 relative z-10">
                      <img src={c.user.profilePic} alt="" className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{c.user.firstName} {c.user.lastName}</p>
                        <p className="text-[10px] text-gray-500">{c.user.major || 'Student'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                        {c.count} Proj
                      </span>
                    </Link>
                  </TiltCard>
                )) : <p className="text-xs text-gray-500 italic py-2">No network connections yet.</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;