// src/components/common/TiltCard.jsx
import { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', delay = 0 }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    // Get the card's dimensions and position on the screen
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate the tilt angles (Max tilt is 10 degrees)
    // If mouse is on the right, rotate Y positively. If mouse is bottom, rotate X negatively.
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out', // Fast, snappy response to mouse
      zIndex: 40 // Bring to front while hovering
    });
  };

  const handleMouseLeave = () => {
    // Snap back to flat when mouse leaves
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out', // Slow, graceful release
      zIndex: 1
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // Combine the "Card Deal" animation class with whatever styling the parent passes down
      className={`animate-card-deal ${className}`}
      // Apply the dynamic 3D styles and the staggered animation delay
      style={{ ...tiltStyle, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default TiltCard;