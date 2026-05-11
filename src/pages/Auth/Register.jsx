// src/pages/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const Register = () => {
  const [role, setRole] = useState('Student');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    companyName: '', companyEmail: '',
    taxDocument: null, taxDocumentName: ''
  });
  
  const { addUser, users, toast, showToast } = useData(); 
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          taxDocument: reader.result, 
          taxDocumentName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- FIXED: Extract, trim, and convert to lowercase for a bulletproof security check ---
    const rawEmail = role === 'Employer' ? formData.companyEmail : formData.email;
    const targetEmail = rawEmail.trim().toLowerCase();

    // Check if the lowercase version of the input matches any lowercase email in the database
    if (users.some(u => u.email && u.email.toLowerCase() === targetEmail)) {
      showToast("This email is already registered. Please log in or use a different email.", "error");
      return; 
    }

    if (role !== 'Employer') {
      if (!targetEmail.endsWith('guc.edu.eg')) {
        showToast("Students and Instructors must use a valid GUC email ending in 'guc.edu.eg'.", "error");
        return; 
      }
    }

    const newUser = {
      role: role,
      password: formData.password,
      profilePic: "https://ui-avatars.com/api/?name=" + (role === 'Employer' ? formData.companyName : formData.firstName)
    };

    if (role === 'Employer') {
      newUser.companyName = formData.companyName;
      // Save the sanitized lowercase email to the database
      newUser.email = targetEmail; 
      newUser.status = 'pending_admin_approval'; 
      newUser.taxDocument = formData.taxDocument;
      newUser.taxDocumentName = formData.taxDocumentName || 'Tax_Document.pdf';
    } else {
      newUser.firstName = formData.firstName;
      newUser.lastName = formData.lastName;
      // Save the sanitized lowercase email to the database
      newUser.email = targetEmail;
      if (role === 'Course Instructor') {
        newUser.linkedCourses = ['BP'];
      }
    }

    addUser(newUser);
    showToast("Registration successful! You can now log in.", "success");
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-sm space-y-6">
        
        <div className="flex flex-col items-center mb-4">
          {/* IMPORTANT: Update this src to point exactly to your logo file! */}
          <img src="/German_University_in_Cairo_logo.png" alt="GUC Logo" className="h-12 object-contain mb-6" />
          <h2 className="text-center text-3xl font-extrabold text-primary">Create an Account</h2>
        </div>
        
        <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-xl shadow-inner">
          {['Student', 'Course Instructor', 'Employer'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 px-2 text-sm font-bold rounded-lg transition-colors ${
                role === r ? 'bg-white shadow-sm text-primary border border-gray-200' : 'text-gray-500 hover:text-primary'
              }`}
            >
              {r === 'Course Instructor' ? 'Instructor' : r}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {role !== 'Employer' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" name="firstName" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" name="lastName" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">GUC Email</label><input type="email" name="email" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>
            </>
          ) : (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input type="text" name="companyName" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label><input type="email" name="companyEmail" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Certificate (PDF)</label>
                <input type="file" accept=".pdf" required onChange={handleFileUpload} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-primary hover:file:bg-gray-100 cursor-pointer" />
              </div>
            </>
          )}

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" name="password" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary sm:text-sm" /></div>

          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-gray-800 transition-colors shadow-sm">
            Register as {role}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </div>
      </div>

      {/* Toast UI for Register Page */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 z-[100] ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-900 text-white border-gray-800'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Register;