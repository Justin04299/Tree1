
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SETTINGS, COLORS } from '../constants';

interface TreeTopStarProps {
  progressRef: React.MutableRefObject<number>;
}

// Local lerp helper for stability
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const TreeTopStar: React.FC<TreeTopStarProps> = ({ progressRef }) => {
  const mainRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (!mainRef.current) return;
    
    const p = progressRef.current;
    const t = state.clock.elapsedTime;

    const targetY = SETTINGS.TREE_HEIGHT;
    const chaosY = SETTINGS.TREE_HEIGHT + 5 + Math.sin(t * 0.5) * 2;
    
    mainRef.current.position.y = lerp(targetY, chaosY, p);
    
    if (p > 0.05) {
      mainRef.current.rotation.y += delta * (0.5 + p * 2);
      mainRef.current.rotation.z = Math.sin(t * 0.3) * 0.2 * p;
    } else {
      mainRef.current.rotation.y += delta * 0.5;
      mainRef.current.rotation.z = 0;
    }

    const scale = 1 + Math.sin(t * 2) * 0.05;
    mainRef.current.scale.setScalar(scale * (1 + p * 0.5));

    if (glowRef.current) {
      glowRef.current.intensity = 2 + Math.sin(t * 4) * 1;
    }
  });

  return (
    <group ref={mainRef}>
      <pointLight ref={glowRef} color={COLORS.GOLD_BRIGHT} distance={10} intensity={2} />
      
      <mesh>
        <cylinderGeometry args={[0, 0.4, 3, 4]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          metalness={1} 
          roughness={0} 
          emissive={COLORS.GOLD_LUXURY} 
          emissiveIntensity={0.5} 
        />
      </mesh>
      
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0, 0.3, 2, 4]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          metalness={1} 
          roughness={0} 
          emissive={COLORS.GOLD_LUXURY} 
          emissiveIntensity={0.5} 
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0, 0.2, 1.5, 4]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          metalness={1} 
          roughness={0} 
        />
      </mesh>

      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial 
          color={COLORS.WHITE_SOFT} 
          emissive={COLORS.WHITE_SOFT} 
          emissiveIntensity={2} 
        />
      </mesh>

      <group>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]} position={[0, 0, 0.6]}>
             <sphereGeometry args={[0.05, 8, 8]} />
             <meshBasicMaterial color={COLORS.GOLD_BRIGHT} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default TreeTopStar;
