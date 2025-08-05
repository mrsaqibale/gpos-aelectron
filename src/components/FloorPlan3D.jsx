import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// WebGL detection function
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Realistic Table Component
const Table3D = ({ position, size, tableNumber, chairCount, isLarge = false }) => {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>
      
      {/* Table Legs */}
      <mesh position={[-size[0]/2 + 0.1, 0.4, -size[2]/2 + 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[size[0]/2 - 0.1, 0.4, -size[2]/2 + 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-size[0]/2 + 0.1, 0.4, size[2]/2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[size[0]/2 - 0.1, 0.4, size[2]/2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Table Number */}
      <mesh position={[0, 0.85, 0]}>
        <planeGeometry args={[0.6, 0.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      
      {/* Chairs */}
      {isLarge ? (
        // Large table with 8 chairs
        <>
          {/* Long side chairs */}
          <Chair3D position={[-size[0]/2 - 0.4, 0, -size[2]/2]} rotation={[0, 0, 0]} />
          <Chair3D position={[-size[0]/2 - 0.4, 0, 0]} rotation={[0, 0, 0]} />
          <Chair3D position={[-size[0]/2 - 0.4, 0, size[2]/2]} rotation={[0, 0, 0]} />
          <Chair3D position={[size[0]/2 + 0.4, 0, -size[2]/2]} rotation={[0, Math.PI, 0]} />
          <Chair3D position={[size[0]/2 + 0.4, 0, 0]} rotation={[0, Math.PI, 0]} />
          <Chair3D position={[size[0]/2 + 0.4, 0, size[2]/2]} rotation={[0, Math.PI, 0]} />
          {/* Short side chairs */}
          <Chair3D position={[0, 0, -size[2]/2 - 0.4]} rotation={[0, Math.PI/2, 0]} />
          <Chair3D position={[0, 0, size[2]/2 + 0.4]} rotation={[0, -Math.PI/2, 0]} />
        </>
      ) : (
        // Small table with 4 chairs
        <>
          <Chair3D position={[-size[0]/2 - 0.4, 0, 0]} rotation={[0, 0, 0]} />
          <Chair3D position={[size[0]/2 + 0.4, 0, 0]} rotation={[0, Math.PI, 0]} />
          <Chair3D position={[0, 0, -size[2]/2 - 0.4]} rotation={[0, Math.PI/2, 0]} />
          <Chair3D position={[0, 0, size[2]/2 + 0.4]} rotation={[0, -Math.PI/2, 0]} />
        </>
      )}
    </group>
  );
};

// Realistic Chair Component
const Chair3D = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Chair Seat */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Chair Back */}
      <mesh position={[0, 0.8, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.05]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Chair Legs */}
      <mesh position={[-0.15, 0.2, -0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.15, 0.2, -0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-0.15, 0.2, 0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.15, 0.2, 0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
};

// Realistic Plant Component
const Plant3D = ({ position }) => {
  return (
    <group position={position}>
      {/* Plant Pot */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Plant Leaves - Multiple spheres for bushy effect */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
      <mesh position={[0.1, 0.9, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 6, 4]} />
        <meshStandardMaterial color="#32cd32" />
      </mesh>
      <mesh position={[-0.1, 0.9, -0.1]} castShadow>
        <sphereGeometry args={[0.35, 6, 4]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
};

// Realistic Restroom Component
const Restroom3D = ({ position }) => {
  return (
    <group position={position}>
      {/* Restroom Building */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.2, 1.5]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 0.6, 0.76]} castShadow>
        <boxGeometry args={[0.6, 1.1, 0.05]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Window */}
      <mesh position={[0.8, 0.8, 0]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Interior - Toilet */}
      <mesh position={[0, 0.2, 0.2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Interior - Sink */}
      <mesh position={[0.5, 0.6, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Realistic Counter/Office Component
const Counter3D = ({ position }) => {
  return (
    <group position={position}>
      {/* Counter Top */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      
      {/* Counter Front */}
      <mesh position={[0, 0.4, -0.35]} castShadow>
        <boxGeometry args={[2.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Computer Monitor */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Monitor Stand */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.05, 0.1, 0.05]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Office Chair */}
      <mesh position={[0, 0.5, -0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

// Seating Area Component
const SeatingArea3D = ({ position }) => {
  return (
    <group position={position}>
      {/* Bench */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.6, 0.4]} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>
      
      {/* Bench Back */}
      <mesh position={[0, 0.8, -0.2]} castShadow>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>
      
      {/* Bench Legs */}
      <mesh position={[-0.8, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0.8, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
};

// Realistic Floor Plan Scene
const FloorPlanScene = () => {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.6}
        castShadow
      />
      
      {/* Floor with tile pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      
      {/* Floor Grid for tile effect */}
      <gridHelper args={[20, 20, '#e0e0e0', '#e0e0e0']} />
      
      {/* Large Rectangular Tables (like in image) */}
      <Table3D position={[-6, 0, -4]} size={[2.5, 0.1, 1.5]} tableNumber="01" isLarge={true} />
      <Table3D position={[0, 0, -4]} size={[2.5, 0.1, 1.5]} tableNumber="08" isLarge={true} />
      
      {/* Medium Square Tables */}
      <Table3D position={[6, 0, -4]} size={[1.8, 0.1, 1.8]} tableNumber="06" />
      <Table3D position={[6, 0, 0]} size={[1.8, 0.1, 1.8]} tableNumber="07" />
      <Table3D position={[6, 0, 4]} size={[1.8, 0.1, 1.8]} tableNumber="09" />
      
      {/* Small Rectangular Tables */}
      <Table3D position={[-6, 0, 4]} size={[2, 0.1, 1.2]} tableNumber="02" />
      <Table3D position={[-3, 0, 4]} size={[2, 0.1, 1.2]} tableNumber="03" />
      <Table3D position={[0, 0, 4]} size={[2, 0.1, 1.2]} tableNumber="04" />
      <Table3D position={[3, 0, 4]} size={[2, 0.1, 1.2]} tableNumber="05" />
      
      {/* Plants */}
      <Plant3D position={[8, 0, -6]} />
      <Plant3D position={[8, 0, -4]} />
      <Plant3D position={[8, 0, 6]} />
      
      {/* Restroom */}
      <Restroom3D position={[8, 0, -2]} />
      
      {/* Seating Area */}
      <SeatingArea3D position={[8, 0, 2]} />
      
      {/* Counter/Desk */}
      <Counter3D position={[8, 0, 6]} />
    </>
  );
};

// Main Floor Plan Component
const FloorPlan3D = () => {
  const [webGLAvailable, setWebGLAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWebGL = () => {
      const available = isWebGLAvailable();
      setWebGLAvailable(available);
      setLoading(false);
    };
    
    checkWebGL();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading 3D Floor Plan...</p>
        </div>
      </div>
    );
  }

  if (!webGLAvailable) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">WebGL Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">Your browser doesn't support WebGL for 3D rendering.</p>
          <p className="text-xs text-gray-500">Try updating your graphics drivers or use a different browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 15, 0], fov: 60 }}
        style={{ background: '#f0f0f0' }}
      >
        <FloorPlanScene />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
};

export default FloorPlan3D; 