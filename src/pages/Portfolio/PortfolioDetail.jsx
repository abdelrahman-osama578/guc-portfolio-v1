// src/pages/Portfolio/PortfolioDetail.jsx
import SkillSphere from '../../components/portfolio/SkillSphere';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit3, Code, Globe, Mail, Folder, MapPin, Briefcase, Calendar } from 'lucide-react';

const PortfolioDetail = () => {
  const { id } = useParams();
  // --- REQ 90: Bring in internships and applications from useData ---
  const { users, projects, courses, updateUser, invitations, sendCourseRequest, internships, applications } = useData();
  const { currentUser } = useAuth();

  const profileUser = users.find(u => u.id === parseInt(id));
  const isOwnProfile = currentUser?.id === profileUser?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(''); 
  
  const [editForm, setEditForm] = useState({
    major: profileUser?.major || '',
    skills: profileUser?.skills?.join(', ') || '',
    linkedin: profileUser?.linkedin || '',
    bio: profileUser?.bio || '', 
    researchInterests: profileUser?.researchInterests || '', 
    education: profileUser?.education || '', 
    address: profileUser?.address || '', 
    contactInfo: profileUser?.contactInfo || '',
    email: profileUser?.email || '',
    profilePic: profileUser?.profilePic || '' 
  });

  if (!profileUser) return <div className="p-8 text-center text-gray-500">Portfolio not found.</div>;

  const displayProjects = projects.filter(p => {
    if (p.creatorId !== profileUser.id) return false;
    return isOwnProfile || p.visibility === 'public';
  });

  // --- REQ 90: Automatically extract completed (accepted) internships ---
  const completedInternships = applications
    .filter(app => app.studentId === profileUser.id && app.status === 'accepted')
    .map(app => internships.find(i => i.id === app.internshipId))
    .filter(Boolean); // Filter out any undefined matches

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(profileUser.id, {
      ...editForm,
      skills: editForm.skills ? editForm.skills.split(',').map(s => s.trim()).filter(s => s !== '') : []
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setEditForm({ ...editForm, profilePic: fileUrl });
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/portfolios" className="flex items-center text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Portfolios
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
          <img src={profileUser.profilePic} alt="Profile" className="w-32 h-32 rounded-full mb-4 border-4 border-gray-50 shadow-sm object-cover" />
          <h2 className="text-2xl font-bold text-primary">
            {profileUser.role === 'Employer' ? profileUser.companyName : `${profileUser.firstName} ${profileUser.lastName}`}
          </h2>
          <p className="text-gray-500 font-medium mb-4">{profileUser.role} {profileUser.major ? `• ${profileUser.major}` : ''}</p>

          <div className="w-full space-y-3 mb-6">
            <a href={`mailto:${profileUser.email}`} className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary p-2 bg-gray-50 rounded-lg transition-colors">
              <Mail className="w-4 h-4" /> {profileUser.email}
            </a>
            {profileUser.linkedin && (
              <a href={profileUser.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg transition-colors">
                <Globe className="w-4 h-4" /> LinkedIn Profile
              </a>
            )}
            {profileUser.contactInfo && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{profileUser.contactInfo}</p>
            )}
          </div>

          {/* Role Specific Sidebar Info */}
          {profileUser.role === 'Student' && (
            <div className="w-full text-left mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
                Interactive Skill Galaxy
              </p>
              <SkillSphere skills={profileUser.skills} />
              <p className="text-[10px] text-gray-400 text-center mt-2 italic">
                Drag to rotate • Hover to inspect
              </p>
            </div>
          )}

          {isOwnProfile && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Form Modal/Card */}
          {isEditing && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 ring-2 ring-primary ring-opacity-20">
              <h3 className="text-lg font-bold text-primary mb-4">Edit Profile Information</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <img src={editForm.profilePic} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {profileUser.role === 'Employer' ? 'Update Company Logo' : 'Update Profile Picture'}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
                
                {profileUser.role === 'Student' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Major</label><input type="text" value={editForm.major} onChange={e => setEditForm({ ...editForm, major: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label><input type="text" value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </>
                )}

                {(profileUser.role === 'Course Instructor' || profileUser.role === 'Employer') && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Biography / About</label><textarea rows="3" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                )}

                {profileUser.role === 'Course Instructor' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Research Interests</label><input type="text" value={editForm.researchInterests} onChange={e => setEditForm({ ...editForm, researchInterests: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Education Background</label><input type="text" value={editForm.education} onChange={e => setEditForm({ ...editForm, education: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </>
                )}

                {profileUser.role === 'Employer' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone/Info</label><input type="text" value={editForm.contactInfo} onChange={e => setEditForm({ ...editForm, contactInfo: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Address (Map Location)</label><input type="text" placeholder="e.g. Cairo, Egypt" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </>
                )}

                <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label><input type="url" value={editForm.linkedin} onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-gray-800">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* Role Specific Main Content */}
          {profileUser.bio && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profileUser.bio}</p>
              
              {profileUser.role === 'Course Instructor' && (
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div><h4 className="font-bold text-sm text-gray-800 mb-1">Research Interests</h4><p className="text-sm text-gray-600">{profileUser.researchInterests || 'None specified'}</p></div>
                  <div><h4 className="font-bold text-sm text-gray-800 mb-1">Education</h4><p className="text-sm text-gray-600">{profileUser.education || 'None specified'}</p></div>
                </div>
              )}
            </div>
          )}

          {profileUser.role === 'Employer' && profileUser.address && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-red-500" /> Location</h3>
              <p className="text-sm text-gray-600 mb-4">{profileUser.address}</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden relative">
                <iframe title="map" width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(profileUser.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}></iframe>
              </div>
            </div>
          )}

          {/* Linked Courses Management for Instructors */}
          {profileUser.role === 'Course Instructor' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <h3 className="text-lg font-bold text-primary mb-4">Linked Courses</h3>
              <div className="space-y-2 mb-4">
                {profileUser.linkedCourses?.map(courseCode => (
                  <div key={courseCode} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="font-bold text-sm text-primary">{courseCode}</span>
                    {isOwnProfile && courseCode !== 'BP' && (
                      <button onClick={() => sendCourseRequest(currentUser.id, courseCode, 'unlink')} className="text-xs text-red-500 hover:underline">
                        Request Unlink
                      </button>
                    )}
                    {courseCode === 'BP' && (
                       <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded uppercase font-bold">Mandatory</span>
                    )}
                  </div>
                ))}
              </div>
              
              {isOwnProfile && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-bold mb-2">Request Link to Course</p>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 text-sm border rounded-lg px-3 py-2 bg-white" 
                      value={selectedCourse} 
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="">Select a course...</option>
                      {courses.filter(c => !profileUser.linkedCourses?.includes(c.code)).map(c => (
                        <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        if(selectedCourse) {
                          sendCourseRequest(currentUser.id, selectedCourse, 'link');
                          setSelectedCourse(''); 
                        } else {
                          alert("Please select a course first.");
                        }
                      }} 
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- REQ 90: Internship Experience Section for Students --- */}
          {profileUser.role === 'Student' && completedInternships.length > 0 && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-orange-500" /> Internship Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedInternships.map(internship => (
                  <div key={internship.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm line-clamp-1">{internship.title}</h4>
                      <p className="text-xs font-bold text-blue-600 mt-1">{internship.companyName}</p>
                      <p className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wider font-bold flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {internship.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Showcase */}
          {profileUser.role === 'Student' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                <Folder className="w-5 h-5 mr-2 text-blue-500" /> Project Showcase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProjects.length === 0 ? (
                   <p className="text-sm text-gray-500 italic">No public projects available.</p>
                ) : (
                  displayProjects.map(project => {
                    const course = courses.find(c => c.id === project.courseId);
                    return (
                      <div key={project.id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 text-blue-600 rounded-lg flex items-center justify-center"><Folder className="w-5 h-5" /></div>
                          <div>
                            <Link to={`/projects/${project.id}`} className="font-bold text-primary hover:text-blue-600 hover:underline">{project.title}</Link>
                            <p className="text-xs text-gray-500">{course?.name}</p>
                          </div>
                        </div>
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-primary flex items-center mt-4">
                            <Code className="w-4 h-4 mr-1" /> View Repository
                          </a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;