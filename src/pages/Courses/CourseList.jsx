// src/pages/Courses/CourseList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Search, ShieldAlert, X } from 'lucide-react';
import TiltCard from '../../components/common/TiltCard'; // <-- IMPORTED TILTCARD

const CourseList = () => {
  const { courses, sendCourseRequest, invitations, showToast, confirmAction } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');

  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingLinkRequests = invitations
    .filter(inv => inv.type === 'course_request' && inv.actionType === 'link' && inv.senderId === currentUser?.id && inv.status === 'pending')
    .map(inv => inv.courseCode);

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
          <span className="flex items-center text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
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
             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all bg-gray-50 focus:bg-white" 
             value={search} 
             onChange={e => setSearch(e.target.value)} 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* FIXED: Added 'index' to the map function */}
         {filteredCourses.map((course, index) => {
            const isLinked = currentUser?.linkedCourses?.includes(course.code);
            const isBP = course.code === 'BP';
            const isPendingLink = pendingLinkRequests.includes(course.code);
            const isPendingUnlink = pendingUnlinkRequests.includes(course.code);
            
            return (
               <TiltCard 
                 key={course.id} 
                 delay={index * 100}
                 className="glass-card bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1 relative group"
               >
                  <span className="absolute -right-2 -bottom-4 text-7xl font-black text-gray-50 opacity-70 pointer-events-none select-none z-0 tracking-tighter">
                    {course.code.substring(0, 3)}
                  </span>

                  <div className="flex items-start gap-4 mb-4 relative z-10">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                       <BookOpen className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-primary">{course.code}</h3>
                       <p className="text-sm text-gray-600 leading-tight">{course.name}</p>
                     </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end relative z-10">
                     {currentUser?.role === 'Course Instructor' && (
                        isLinked ? (
                          isBP ? (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-gray-200 shadow-sm">
                              Mandatory Course
                            </span>
                          ) : isPendingUnlink ? (
                            <span className="text-xs bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold flex items-center cursor-not-allowed border border-red-100 shadow-sm">
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
                              className="animate-pop flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                            >
                              <X className="w-4 h-4 mr-1"/> Request Unlink
                            </button>
                          )
                        ) : (
                          isPendingLink ? (
                            <span className="text-xs bg-blue-50 text-blue-500 px-4 py-2 rounded-lg font-bold flex items-center cursor-not-allowed border border-blue-100 shadow-sm">
                              <Plus className="w-4 h-4 mr-1.5" /> Link Pending
                            </span>
                          ) : (
                            <button 
                              onClick={() => {
                                sendCourseRequest(currentUser.id, course.code, 'link');
                                if(showToast) showToast(`Link request sent for ${course.code}`, "success");
                              }} 
                              className="animate-pop flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4 mr-1"/> Request Link
                            </button>
                          )
                        )
                     )}
                     
                     {currentUser?.role === 'Administrator' && (
                       <span className="text-xs text-gray-400 italic">Manage via Admin Panel</span>
                     )}
                  </div>
               </TiltCard>
            )
         })}
         {filteredCourses.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl bg-surface">
             No courses found matching your search.
           </div>
         )}
      </div>
    </div>
  )
};

export default CourseList;