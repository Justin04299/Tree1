
import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { SETTINGS, COLORS } from '../constants';

interface PolaroidsProps {
  count: number;
  progressRef: React.MutableRefObject<number>;
}

const Polaroids: React.FC<PolaroidsProps> = ({ count, progressRef }) => {
  const polaroidData = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // Tree position
      const h = 2 + Math.random() * (SETTINGS.TREE_HEIGHT - 4);
      const r = (1 - h / SETTINGS.TREE_HEIGHT) * SETTINGS.TREE_RADIUS * 0.8;
      const theta = (i / count) * Math.PI * 2;
      
      const target: [number, number, number] = [
        Math.cos(theta) * r,
        h,
        Math.sin(theta) * r
      ];

      // Chaos
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      const cR = SETTINGS.CHAOS_RADIUS * 0.9;
      
      const chaos: [number, number, number] = [
        cR * Math.sin(cPhi) * Math.cos(cTheta),
        cR * Math.sin(cPhi) * Math.sin(cTheta) + 5,
        cR * Math.cos(cPhi)
      ];

      return {
        target,
        chaos,
        rotation: [Math.random() * 0.5, theta, 0],
        id: i,
        imgUrl: `https://picsum.photos/seed/${i + 50}/200/200`
      };
    });
  }, [count]);

  return (
    <>
      {polaroidData.map((item) => (
        <PolaroidItem key={item.id} data={item} progressRef={progressRef} />
      ))}
    </>
  );
};

interface PolaroidItemProps {
  data: any;
  progressRef: React.MutableRefObject<number>;
}

const PolaroidItem: React.FC<PolaroidItemProps> = ({ data, progressRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  // Fix: Explicitly cast to THREE.Texture because useLoader return type is a union of Texture | Texture[]
  const texture = useLoader(THREE.TextureLoader, data.imgUrl) as THREE.Texture;

  useFrame((state, delta) => {
    if (meshRef.current) {
      const p = progressRef.current;
      const pos = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...data.target),
        new THREE.Vector3(...data.chaos),
        p
      );
      meshRef.current.position.copy(pos);
      
      // Auto-rotation in chaos
      if (p > 0.1) {
          meshRef.current.rotation.y += delta * p;
          meshRef.current.rotation.x += delta * 0.5 * p;
      } else {
          meshRef.current.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Frame */}
      <mesh>
        <planeGeometry args={[1.2, 1.4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0.1, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Backing */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2, 1.4]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
    </group>
  );
};

export default Polaroids;
