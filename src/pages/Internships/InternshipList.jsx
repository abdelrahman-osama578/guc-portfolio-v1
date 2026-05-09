// src/pages/Internships/InternshipList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Briefcase, CheckCircle2, Filter, Building2, Clock, ArrowUpDown, FileText, Code, X, ArrowRight } from 'lucide-react';

const InternshipList = () => {
  const { internships, applications, addApplication } = useData();
  const { currentUser } = useAuth();

  // --- REQ 80 & 82: FILTER & SORT STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // REQ 82: Sort State

  // --- REQ 83: MODAL STATE ---
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // 1. Only show active, non-archived internships
  const activeInternships = internships.filter(i => !i.isArchived && i.status === 'hiring');

  // 2. Extract unique dropdown options
  const uniqueCompanies = [...new Set(activeInternships.map(i => i.companyName))].sort();
  const uniqueDurations = [...new Set(activeInternships.map(i => i.duration))].sort();

  // 3. Filter Logic
  const filteredInternships = activeInternships.filter(internship => {
    if (searchQuery && !internship.title.toLowerCase().includes(searchQuery.toLowerCase()) && !internship.companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (companyFilter && internship.companyName !== companyFilter) return false;
    if (durationFilter && internship.duration !== durationFilter) return false;
    return true;
  });

  // --- REQ 82: SORT LOGIC ---
  const sortedInternships = [...filteredInternships].sort((a, b) => {
    const dateA = new Date(a.postedDate);
    const dateB = new Date(b.postedDate);
    if (sortOption === 'newest') return dateB - dateA; // Newest first
    if (sortOption === 'oldest') return dateA - dateB; // Oldest first
    return 0;
  });

  // Check if student already applied
  const hasApplied = (internshipId) => applications.some(app => app.internshipId === internshipId && app.studentId === currentUser?.id);

  const handleApply = (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;
    addApplication({ internshipId: selectedInternship.id, studentId: currentUser.id, coverLetter });
    setSelectedInternship(null);
    setCoverLetter('');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Explore Internships</h2>
      </div>

      {/* --- FILTERING & SORTING BANNER --- */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700">Filter & Sort Opportunities</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles..."
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="">Any Duration</option>
              {uniqueDurations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>

          {/* REQ 82: Sort by Posted Date */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="w-full text-sm border border-blue-200 rounded-xl pl-9 pr-3 py-2.5 bg-blue-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-medium text-blue-800"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Sort: Newest Posted</option>
              <option value="oldest">Sort: Oldest Posted</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- INTERNSHIP LIST --- */}
      <div className="space-y-4">
        {/* Render the SORTED array */}
        {sortedInternships.map(internship => (
          <div key={internship.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                {/* FIXED: The Title is now the main clickable element that opens the modal */}
                <button
                  onClick={() => setSelectedInternship(internship)}
                  className="text-lg font-bold text-primary hover:text-blue-600 transition-colors text-left"
                >
                  {internship.title}
                </button>
                <p className="text-sm font-medium text-gray-600 mb-2 mt-1">{internship.companyName}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {internship.duration}</span>
                  <span className="flex items-center text-red-500"><Calendar className="w-3 h-3 mr-1" /> Deadline: {internship.deadline}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full min-h-[80px]">
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Posted {internship.postedDate}</span>

              {/* REQ 83: View Details button (Styled to match the rest of the app) */}
              <button
                onClick={() => setSelectedInternship(internship)}
                className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors mt-4 md:mt-0"
              >
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ))}

        {sortedInternships.length === 0 && (
          <div className="py-12 text-center bg-surface rounded-2xl border border-dashed border-gray-300">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No internships match your current filters.</p>
            <button onClick={() => { setSearchQuery(''); setCompanyFilter(''); setDurationFilter(''); setSortOption('newest'); }} className="mt-3 text-sm text-blue-600 hover:underline font-bold">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* --- REQ 83: ENHANCED VIEW DETAILS MODAL --- */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4 shrink-0 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-1">{selectedInternship.title}</h3>
                <p className="text-sm font-bold text-blue-600 flex items-center">
                  <Building2 className="w-4 h-4 mr-1" /> {selectedInternship.companyName}
                </p>
              </div>
              <button onClick={() => { setSelectedInternship(null); setCoverLetter(''); }} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-6">

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-700"><Clock className="w-4 h-4 mr-2 text-gray-400" /> Duration: {selectedInternship.duration}</div>
                <div className="flex items-center text-red-600"><Calendar className="w-4 h-4 mr-2 text-red-400" /> Deadline: {selectedInternship.deadline}</div>
                <div className="flex items-center text-gray-500"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Posted: {selectedInternship.postedDate}</div>
              </div>

              {/* Job Details */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center uppercase tracking-wider"><FileText className="w-4 h-4 mr-2 text-blue-500" /> Role Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white border border-gray-100 p-4 rounded-xl">
                  {selectedInternship.details || "No detailed description provided by the employer."}
                </p>
              </div>

              {/* Skills & Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.skills?.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">{skill}</span>
                    ))}
                    {(!selectedInternship.skills || selectedInternship.skills.length === 0) && <span className="text-xs text-gray-400 italic">None specified</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center uppercase tracking-wider"><Code className="w-4 h-4 mr-1 text-gray-400" /> Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.languages?.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">{lang}</span>
                    ))}
                    {(!selectedInternship.languages || selectedInternship.languages.length === 0) && <span className="text-xs text-gray-400 italic">None specified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Section (Fixed at bottom) */}
            <div className="mt-4 pt-4 border-t border-gray-100 shrink-0">
              {currentUser?.role === 'Student' ? (
                hasApplied(selectedInternship.id) ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center text-green-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> You have already applied for this internship!
                  </div>
                ) : (
                  <form onSubmit={handleApply}>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Submit Your Application</label>
                    <textarea
                      required rows="3"
                      placeholder="Write your cover letter here. Why are you a great fit for this role?"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-primary outline-none resize-none shadow-inner"
                      value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setSelectedInternship(null); setCoverLetter(''); }} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Close</button>
                      <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center">
                        Submit Application <CheckCircle2 className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="text-center text-sm text-gray-500 italic py-2">
                  Only students can apply for internships.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipList;