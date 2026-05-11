// src/components/common/MagneticButton.jsx
import { useRef, useState } from 'react';

const MagneticButton = ({ children, className = '', onClick, type = "button", title }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate distance from center. The * 0.3 is the "magnetic pull strength". 
    // Lower number = weaker pull. Higher number = stronger pull.
    const pullX = (e.clientX - centerX) * 0.3; 
    const pullY = (e.clientY - centerY) * 0.3;

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    // Snap back to exactly center when the mouse leaves
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      title={title}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // We use ease-out for a snappy but smooth magnetic pull
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {children}
    </button>
  );
};

export default MagneticButton;