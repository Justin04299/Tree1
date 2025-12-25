
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_SHADER } from '../constants';

interface FoliageProps {
  data: { chaos: Float32Array; target: Float32Array };
  progressRef: React.MutableRefObject<number>;
}

const Foliage: React.FC<FoliageProps> = ({ data, progressRef }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
      },
      vertexShader: FOLIAGE_SHADER.vertexShader,
      fragmentShader: FOLIAGE_SHADER.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={data.target.length / 3} 
          array={data.target} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-chaosPosition" 
          count={data.chaos.length / 3} 
          array={data.chaos} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-targetPosition" 
          count={data.target.length / 3} 
          array={data.target} 
          itemSize={3} 
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};

export default Foliage;
