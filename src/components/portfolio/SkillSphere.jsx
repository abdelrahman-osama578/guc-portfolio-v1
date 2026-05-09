// src/components/portfolio/SkillSphere.jsx
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. The individual 3D text nodes
const Word = ({ word, pos }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Make the text always face the camera as the sphere rotates
  useFrame(({ camera }) => {
    ref.current.quaternion.copy(camera.quaternion);
  });

  return (
    <Text
      ref={ref}
      position={pos}
      onPointerOver={(e) => { 
        e.stopPropagation(); 
        setHovered(true); 
        document.body.style.cursor = 'pointer'; 
      }}
      onPointerOut={() => { 
        setHovered(false); 
        document.body.style.cursor = 'auto'; 
      }}
      fontSize={2.5}
      color={hovered ? '#2563eb' : '#4b5563'} // Turns blue when hovered!
      anchorX="center"
      anchorY="middle"
    >
      {word}
    </Text>
  );
};

// 2. The mathematical sphere that holds the words
const Cloud = ({ skills, radius = 20 }) => {
  const count = skills.length;
  
  // Calculate spherical positions using a Fibonacci lattice for even distribution
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    for (let i = 1; i <= count; i++) {
      const phi = Math.acos(-1 + (2 * i) / (count + 1));
      const theta = Math.sqrt((count + 1) * Math.PI) * phi;
      const pos = new THREE.Vector3().setFromSpherical(spherical.set(radius, phi, theta));
      temp.push([pos, skills[i - 1]]);
    }
    return temp;
  }, [count, skills, radius]);

  const ref = useRef();
  
  // Slowly rotate the entire group of words
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime / 4;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 4) / 4;
  });

  return (
    <group ref={ref}>
      {words.map(([pos, word], index) => (
        <Word key={index} pos={pos} word={word} />
      ))}
    </group>
  );
};

// 3. The main wrapper component
export default function SkillSphere({ skills }) {
  if (!skills || skills.length === 0) {
    return <p className="text-xs text-gray-400 italic text-center py-4">No skills listed</p>;
  }

  // If a student only has 2 or 3 skills, the sphere looks empty. 
  // We duplicate them dynamically so the 3D effect always looks full and impressive!
  let displaySkills = [...skills];
  if (displaySkills.length < 8) {
    displaySkills = [...displaySkills, ...displaySkills, ...displaySkills].slice(0, 12);
  }

  return (
    <div className="w-full h-[250px] bg-gray-50 rounded-xl overflow-hidden cursor-move border border-gray-100 shadow-inner">
      <Canvas camera={{ position: [0, 0, 35], fov: 90 }}>
        <fog attach="fog" args={['#f9fafb', 0, 40]} />
        <ambientLight intensity={1} />
        <Cloud skills={displaySkills} radius={20} />
        {/* Allows employers to click and drag to spin the galaxy */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}