// src/components/common/TiltCard.jsx
import { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', delay = null, enableTilt = false }) => {
  const cardRef = useRef(null);
  
  // Track 3D rotation and Glare position. Default to 'none' if disabled.
  const [transform, setTransform] = useState('none');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    // Escape early if tilt is disabled
    if (!enableTilt || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const rotateX = ((yPct - 50) / 50) * -10; 
    const rotateY = ((xPct - 50) / 50) * 10;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({ x: xPct, y: yPct, opacity: 0.15 }); 
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    setTransform('none');
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    /* OUTER WRAPPER: Handles the cascading entry animation */
    <div
      className={`${delay !== null ? 'animate-card-deal' : ''} h-full w-full`}
      style={delay !== null ? { animationDelay: `${delay}ms` } : {}}
    >
      {/* INNER WRAPPER: Handles the 3D mouse tracking (if enabled) and layouts */}
      <div
        ref={cardRef}
        onMouseMove={enableTilt ? handleMouseMove : undefined}
        onMouseLeave={enableTilt ? handleMouseLeave : undefined}
        className={`relative ${className}`}
        style={enableTilt ? {
          transform,
          transition: 'transform 0.1s ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        } : {}}
      >
        {/* Only render the dynamic glare layer if tilt is enabled */}
        {enableTilt && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
              mixBlendMode: 'overlay',
              zIndex: 50
            }}
          />
        )}
        
        {children}
      </div>
    </div>
  );
};

export default TiltCard;