// src/pages/Courses/CourseList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Search, ShieldAlert, X } from 'lucide-react';

const CourseList = () => {
  // FIXED: Brought in 'invitations', 'showToast', and 'confirmAction'
  const { courses, sendCourseRequest, invitations, showToast, confirmAction } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');

  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- NEW: Dynamic Request Tracking ---
  // Find courses the instructor wants to link but are waiting for admin approval
  const pendingLinkRequests = invitations
    .filter(inv => inv.type === 'course_request' && inv.actionType === 'link' && inv.senderId === currentUser?.id && inv.status === 'pending')
    .map(inv => inv.courseCode);

  // Find courses the instructor wants to unlink but are waiting for admin approval
  const pendingUnlinkRequests = invitations
    .filter(inv => inv.type === 'course_request' && inv.actionType === 'unlink' && inv.senderId === currentUser?.id && inv.status === 'pending')
    .map(inv => inv.courseCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" /> University Courses
        </h2>
        {currentUser?.role === 'Administrator' && (
          <span className="flex items-center text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 mr-1" /> Admin View
          </span>
        )}
      </div>

      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
           <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search by course code or name..." 
             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all" 
             value={search} 
             onChange={e => setSearch(e.target.value)} 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredCourses.map(course => {
            const isLinked = currentUser?.linkedCourses?.includes(course.code);
            const isBP = course.code === 'BP';
            
            // Determine pending status
            const isPendingLink = pendingLinkRequests.includes(course.code);
            const isPendingUnlink = pendingUnlinkRequests.includes(course.code);
            
            return (
               <div key={course.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                       <BookOpen className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-primary">{course.code}</h3>
                       <p className="text-sm text-gray-600 leading-tight">{course.name}</p>
                     </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end">
                     {/* Instructor Linking Actions (Req 7) */}
                     {currentUser?.role === 'Course Instructor' && (
                        isLinked ? (
                          isBP ? (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                              Mandatory Course
                            </span>
                          ) : isPendingUnlink ? (
                            <span className="text-xs bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold flex items-center cursor-not-allowed border border-red-100">
                              <X className="w-4 h-4 mr-1.5" /> Unlink Pending
                            </span>
                          ) : (
                            <button 
                              onClick={() => {
                                if (confirmAction) {
                                  confirmAction(`Are you sure you want to request unlinking from ${course.code}?`, "Request Unlink", () => {
                                    sendCourseRequest(currentUser.id, course.code, 'unlink');
                                    if(showToast) showToast(`Unlink request sent for ${course.code}`);
                                  });
                                } else {
                                  sendCourseRequest(currentUser.id, course.code, 'unlink');
                                }
                              }} 
                              className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4 mr-1"/> Request Unlink
                            </button>
                          )
                        ) : (
                          isPendingLink ? (
                            <span className="text-xs bg-blue-50 text-blue-500 px-4 py-2 rounded-lg font-bold flex items-center cursor-not-allowed border border-blue-100">
                              <Plus className="w-4 h-4 mr-1.5" /> Link Pending
                            </span>
                          ) : (
                            <button 
                              onClick={() => {
                                sendCourseRequest(currentUser.id, course.code, 'link');
                                if(showToast) showToast(`Link request sent for ${course.code}`, "success");
                              }} 
                              className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 mr-1"/> Request Link
                            </button>
                          )
                        )
                     )}
                     
                     {/* Admin Message */}
                     {currentUser?.role === 'Administrator' && (
                       <span className="text-xs text-gray-400 italic">Manage via Admin Panel</span>
                     )}
                  </div>
               </div>
            )
         })}
         {filteredCourses.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-500">
             No courses found matching your search.
           </div>
         )}
      </div>
    </div>
  )
};

export default CourseList;