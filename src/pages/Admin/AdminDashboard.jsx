// src/pages/Admin/AdminDashboard.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Folder, BookOpen, Check, X, AlertTriangle, Plus, Trash2, ShieldAlert, Download, Eye, FileText, MapPin, Phone, Info, Link2, Unlink, Edit } from 'lucide-react';
const AdminDashboard = () => {
  // FIXED: Brought in invitations and resolveCourseRequest
  const { users, projects, courses, updateUserStatus, resolveFlag, toggleUserActiveStatus, addCourse, updateCourse, deleteCourse, addUser, showToast, toggleProjectStatus, invitations, resolveCourseRequest } = useData(); 
  const { currentUser } = useAuth();
  
  const flaggedProjects = projects.filter(p => p.isFlagged);
  const pendingEmployers = users.filter(u => u.role === 'Employer' && u.status === 'pending_admin_approval');
  const systemUsers = users.filter(u => u.status !== 'pending_admin_approval');
  
  // --- NEW: Filter for pending course requests ---
  const pendingCourseRequests = invitations.filter(inv => inv.type === 'course_request' && inv.status === 'pending');

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [viewingPdf, setViewingPdf] = useState(null);

  const handleViewPdf = (pdfData) => {
    if (!pdfData) return;
    if (pdfData.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Parts = pdfData.split(',');
        const binaryString = window.atob(base64Parts[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setViewingPdf(URL.createObjectURL(blob));
      } catch (err) { setViewingPdf(pdfData); }
    } else { setViewingPdf(pdfData); }
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if(newCourseCode && newCourseName) {
      const formattedCode = newCourseCode.trim().toUpperCase();
      const formattedName = newCourseName.trim();
      if (courses.some(c => c.code.toUpperCase() === formattedCode)) {
        if (showToast) showToast(`Error: The course code "${formattedCode}" already exists.`, "error");
        return; 
      }
      addCourse(formattedCode, formattedName);
      setNewCourseCode(''); setNewCourseName('');
      if(showToast) showToast("Course added successfully!", "success");
    }
  };

  const handleSaveEditCourse = (id) => {
    if(editCourseCode && editCourseName) {
      const formattedCode = editCourseCode.trim().toUpperCase();
      const formattedName = editCourseName.trim();
      if (courses.some(c => c.code.toUpperCase() === formattedCode && c.id !== id)) {
        if (showToast) showToast(`Error: The course code "${formattedCode}" already exists.`, "error");
        return; 
      }
      updateCourse(id, formattedCode, formattedName);
      setEditingCourseId(null);
      if(showToast) showToast("Course updated successfully!", "success");
    }
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if(newAdminEmail && newAdminPassword) {
      addUser({
        firstName: "New", lastName: "Admin", email: newAdminEmail, password: newAdminPassword,
        role: "Administrator", status: "active", profilePic: "https://ui-avatars.com/api/?name=Admin"
      });
      setNewAdminEmail(''); setNewAdminPassword('');
      if(showToast) showToast("New Admin account created!");
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-primary mb-6">Administrator Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Users</p><h3 className="text-3xl font-bold">{users.length}</h3></div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users /></div>
        </div>
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Projects</p><h3 className="text-3xl font-bold">{projects.length}</h3></div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><Folder /></div>
        </div>
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Courses</p><h3 className="text-3xl font-bold">{courses.length}</h3></div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><BookOpen /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          {/* Pending Employers */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Pending Employer Approvals</h3>
            <div className="space-y-4">
              {pendingEmployers.length === 0 ? <p className="text-sm text-gray-500">No pending approvals.</p> : (
                pendingEmployers.map(emp => (
                  <div key={emp.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-full">
                         <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1 block">Company Registration Info</span>
                         <h4 className="font-bold text-primary text-lg">{emp.companyName}</h4>
                         <p className="text-sm text-blue-600 font-medium mb-3"><a href={`mailto:${emp.email}`} className="hover:underline">{emp.email}</a></p>
                         <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 mb-3">
                           {emp.bio && <p className="text-sm text-gray-600 flex items-start"><Info className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0"/> {emp.bio}</p>}
                           {emp.contactInfo && <p className="text-sm text-gray-600 flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0"/> {emp.contactInfo}</p>}
                           {emp.address && <p className="text-sm text-gray-600 flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-400 shrink-0"/> {emp.address}</p>}
                           {!emp.bio && !emp.contactInfo && !emp.address && <p className="text-xs text-gray-400 italic">No additional profile details provided yet.</p>}
                         </div>
                       </div>
                       <div className="flex gap-2 ml-4">
                         <button onClick={() => { updateUserStatus(emp.id, 'active'); if(showToast) showToast("Employer Approved!"); }} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 shadow-sm transition-transform hover:scale-105" title="Approve"><Check className="w-5 h-5"/></button>
                         <button onClick={() => { updateUserStatus(emp.id, 'rejected'); if(showToast) showToast("Employer Rejected.", "error"); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 shadow-sm transition-transform hover:scale-105" title="Reject"><X className="w-5 h-5"/></button>
                       </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                       <div className="flex items-center text-sm font-medium text-gray-700 truncate mr-4">
                         <FileText className="w-4 h-4 mr-2 text-blue-500 shrink-0" /> 
                         <span className="truncate">{emp.taxDocumentName || 'Tax_Document.pdf'}</span>
                       </div>
                       <div className="flex gap-2 shrink-0">
                         <button onClick={() => handleViewPdf(emp.taxDocument || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')} className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"><Eye className="w-3 h-3 mr-1" /> View</button>
                         <a href={emp.taxDocument || '#'} download={emp.taxDocumentName || "Tax_Document.pdf"} className="flex items-center text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"><Download className="w-3 h-3 mr-1" /> Download</a>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- NEW: Pending Course Requests --- */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
               <BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Pending Course Requests
            </h3>
            <div className="space-y-3">
              {pendingCourseRequests.length === 0 ? <p className="text-sm text-gray-500">No pending course requests.</p> : (
                pendingCourseRequests.map(req => {
                  const instructor = users.find(u => u.id === req.senderId);
                  const isLink = req.actionType === 'link';

                  return (
                    <div key={req.id} className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${isLink ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isLink ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {isLink ? <Link2 className="w-5 h-5" /> : <Unlink className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {instructor?.firstName} {instructor?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Wants to <span className="font-bold uppercase tracking-wider">{req.actionType}</span> course <span className="font-bold">{req.courseCode}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 ml-4">
                         <button onClick={() => { resolveCourseRequest(req.id, 'accepted'); if(showToast) showToast("Request Approved", "success"); }} className="p-2 bg-white text-green-600 border border-gray-200 rounded-lg hover:bg-green-50 shadow-sm transition-transform hover:scale-105" title="Approve"><Check className="w-4 h-4"/></button>
                         <button onClick={() => { resolveCourseRequest(req.id, 'rejected'); if(showToast) showToast("Request Rejected", "error"); }} className="p-2 bg-white text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 shadow-sm transition-transform hover:scale-105" title="Reject"><X className="w-4 h-4"/></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* System Users */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 row-span-2">
          <h3 className="text-lg font-bold text-primary mb-6">System Users</h3>
          <div className="overflow-y-auto max-h-[700px] space-y-6 pr-2">
            {['Administrator', 'Course Instructor', 'Student', 'Employer'].map(role => {
              const roleUsers = systemUsers.filter(u => u.role === role);
              if (roleUsers.length === 0) return null;
              return (
                <div key={role} className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
                    {role}s <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{roleUsers.length}</span>
                  </h4>
                  {roleUsers.map(user => {
                    const isRejected = user.status === 'rejected';
                    const isActive = user.status !== 'deactivated' && !isRejected;
                    const isSuperAdmin = user.id === 3 || user.email === 'admin@guc.edu.eg';
                    const isSelf = user.id === currentUser?.id;
                    const canToggleStatus = !isSuperAdmin && !isSelf;
                    
                    return (
                      <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors border ${isActive ? 'hover:bg-gray-50 border-transparent' : 'bg-red-50 border-red-100 opacity-80'}`}>
                        <div className="flex items-center gap-3">
                          <img src={user.profilePic} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          <div>
                            <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-red-700 line-through'}`}>{user.firstName || user.companyName} {user.lastName || ''}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isRejected ? (
                            <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md uppercase tracking-wider">Rejected</span>
                          ) : canToggleStatus ? (
                             <button onClick={() => toggleUserActiveStatus(user.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                               {isActive ? 'Deactivate' : 'Reactivate'}
                             </button>
                          ) : isSuperAdmin ? (
                             <span className="text-[10px] font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-md uppercase tracking-wider">Super Admin</span>
                          ) : isSelf ? (
                             <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">You</span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Management */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 row-span-2">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
            <Folder className="w-5 h-5 mr-2" /> Project Management
          </h3>
          <div className="overflow-y-auto max-h-[700px] space-y-3 pr-2">
            {projects.length === 0 ? <p className="text-sm text-gray-500">No projects in the system.</p> : (
              projects.map(proj => {
                const isActive = proj.status === 'active';
                const creator = users.find(u => u.id === proj.creatorId);
                
                return (
                  <div key={proj.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${isActive ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
                    <div>
                      <h4 className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-red-700'}`}>{proj.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Creator: {creator?.firstName} {creator?.lastName} | Course: {courses.find(c => c.id === proj.courseId)?.code}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {proj.isFlagged && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold uppercase tracking-wider"><AlertTriangle className="w-3 h-3 inline mr-1" /> Flagged</span>}
                      <button 
                        onClick={() => toggleProjectStatus(proj.id)} 
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Manage Courses</h3>
           <form onSubmit={handleAddCourse} className="flex gap-2 mb-4">
             <input type="text" placeholder="Code (e.g. CSEN701)" required className="w-1/3 px-3 py-2 border rounded-lg text-sm uppercase" value={newCourseCode} onChange={e=>setNewCourseCode(e.target.value)} />
             <input type="text" placeholder="Course Name" required className="flex-1 px-3 py-2 border rounded-lg text-sm" value={newCourseName} onChange={e=>setNewCourseName(e.target.value)} />
             <button type="submit" className="bg-primary text-white p-2 rounded-lg hover:bg-gray-800"><Plus className="w-5 h-5" /></button>
           </form>
           <div className="space-y-2 overflow-y-auto max-h-48 pr-2">
             {courses.map(course => (
               <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors hover:bg-white">
                 {editingCourseId === course.id ? (
                   <div className="flex-1 flex gap-2 mr-2">
                     <input type="text" className="w-1/3 px-2 py-1 text-sm border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-400 uppercase" value={editCourseCode} onChange={e => setEditCourseCode(e.target.value)} />
                     <input type="text" className="flex-1 px-2 py-1 text-sm border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-400" value={editCourseName} onChange={e => setEditCourseName(e.target.value)} />
                   </div>
                 ) : (
                   <div>
                     <span className="font-bold text-sm text-primary mr-2">{course.code}</span>
                     <span className="text-sm text-gray-600">{course.name}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-1 shrink-0">
                   {editingCourseId === course.id ? (
                     <>
                       <button onClick={() => setEditingCourseId(null)} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                       <button onClick={() => handleSaveEditCourse(course.id)} className="px-2 py-1 text-xs bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Save</button>
                     </>
                   ) : (
                     <>
                       {course.code !== 'BP' && (
                         <>
                           <button onClick={() => { setEditingCourseId(course.id); setEditCourseCode(course.code); setEditCourseName(course.name); }} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => deleteCourse(course.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                         </>
                       )}
                     </>
                   )}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Create Administrator */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><ShieldAlert className="w-5 h-5 mr-2" /> Create Administrator</h3>
           <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Admin Email</label><input type="email" required className="w-full px-3 py-2 border rounded-lg text-sm" value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Password</label><input type="password" required className="w-full px-3 py-2 border rounded-lg text-sm" value={newAdminPassword} onChange={e=>setNewAdminPassword(e.target.value)} /></div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Create Account</button>
           </form>
        </div>

        {/* Flagged Projects & Appeals */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-red-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> Moderation Queue (Flagged Projects)
          </h3>
          <div className="space-y-4">
            {flaggedProjects.length === 0 ? <p className="text-sm text-gray-500">No projects currently flagged.</p> : (
              flaggedProjects.map(proj => (
                <div key={proj.id} className="p-5 border border-red-200 bg-red-50 rounded-xl">
                  <div className="flex flex-col">
                    <h4 className="font-bold text-lg text-primary">{proj.title}</h4>
                    <p className="text-sm text-red-700 mt-1"><span className="font-bold">Flag Reason:</span> {proj.flagReason}</p>
                    
                    {proj.appealMessage ? (
                      <div className="mt-4 p-4 bg-white border border-red-100 rounded-lg text-sm shadow-sm">
                        <span className="font-bold text-gray-700 block mb-1">Student Appeal:</span>
                        <p className="text-gray-600 italic">"{proj.appealMessage}"</p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 italic">
                        No appeal submitted by the student yet. Project is deactivated pending appeal.
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-red-200">
                      <button onClick={() => resolveFlag(proj.id, false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm">
                        Dismiss Flag & Keep Active
                      </button>
                      <button onClick={() => resolveFlag(proj.id, true)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">
                        Enforce Deactivation (Reject Appeal)
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-4 w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-600"/> Document Viewer</h3>
              <button onClick={() => setViewingPdf(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <object data={viewingPdf} type="application/pdf" className="w-full flex-1 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center h-full text-gray-500 flex-col">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>Your browser does not support viewing PDFs directly.</p>
                <a href={viewingPdf} download className="text-blue-500 hover:underline mt-2">Click here to download it instead.</a>
              </div>
            </object>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;