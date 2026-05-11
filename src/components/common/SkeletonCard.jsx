// src/components/common/SkeletonCard.jsx

const SkeletonCard = () => {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[280px] animate-pulse">
      {/* Top Row: Icon and Favorite Button placeholders */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
      
      {/* Title & Course placeholders */}
      <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-6"></div>
      
      {/* Language tags placeholders */}
      <div className="flex gap-2 mb-4 flex-1">
        <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
        <div className="h-6 w-14 bg-gray-200 rounded-md"></div>
      </div>

      {/* Bottom Footer placeholders */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;