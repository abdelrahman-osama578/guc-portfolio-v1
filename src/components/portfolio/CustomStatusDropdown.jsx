// src/components/portfolio/CustomStatusDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, AlertTriangle, Clock, Star } from 'lucide-react';

const CustomStatusDropdown = ({ status, onChange, options, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === status);

  // Assign icons based on status
  const getIcon = (value) => {
    switch (value) {
      case 'accepted': return <Check className="w-3.5 h-3.5 mr-1.5" />;
      case 'rejected': return <X className="w-3.5 h-3.5 mr-1.5" />;
      case 'nominated': return <Star className="w-3.5 h-3.5 mr-1.5" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      case 'completed': return <Check className="w-3.5 h-3.5 mr-1.5" />;
      case 'post-poned': return <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />;
      default: return null; 
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between text-[10px] font-bold px-3 py-1.5 rounded-full border outline-none tracking-wider uppercase transition-all whitespace-nowrap 
          ${status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' : ''}
          ${status === 'nominated' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : ''}
          ${status === 'accepted' || status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}
          ${status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : ''}
          ${status === 'post-poned' ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm'}
        `}
      >
        <div className="flex items-center">
          {getIcon(status)}
          {selectedOption ? selectedOption.label : 'Select'}
        </div>
        {!disabled && <ChevronDown className="w-3 h-3 ml-2 opacity-50" />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            <button 
              key={option.value}
              type="button"
              onClick={() => {
                if (status !== option.value) onChange({ target: { value: option.value } });
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-bold transition-colors
                ${status === option.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}
                ${option.value === 'accepted' || option.value === 'completed' ? 'hover:bg-green-50 hover:text-green-700' : ''}
                ${option.value === 'rejected' ? 'hover:bg-red-50 hover:text-red-700' : ''}
                ${option.value === 'nominated' ? 'hover:bg-blue-50 hover:text-blue-700' : ''}
                ${option.value === 'pending' ? 'hover:bg-yellow-50 hover:text-yellow-700' : ''}
                ${option.value === 'post-poned' ? 'hover:bg-orange-50 hover:text-orange-700' : ''}
              `}
            >
              {getIcon(option.value)}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomStatusDropdown;