
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentData } from '../types';
import { COLORS } from '../constants';

interface OrnamentsProps {
  items: OrnamentData[];
  progressRef: React.MutableRefObject<number>;
}

const Ornaments: React.FC<OrnamentsProps> = ({ items, progressRef }) => {
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const ballsRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const splitItems = useMemo(() => {
    return {
      gift: items.filter(i => i.type === 'gift'),
      ball: items.filter(i => i.type === 'ball'),
      light: items.filter(i => i.type === 'light')
    };
  }, [items]);

  // Particle positions for chaos state
  const particleData = useMemo(() => {
    const count = items.length * 10;
    const positions = new Float32Array(count * 3);
    const parentIndices = new Int32Array(count);
    for (let i = 0; i < count; i++) {
      parentIndices[i] = Math.floor(i / 10);
    }
    return { positions, parentIndices };
  }, [items]);

  const dummy = new THREE.Object3D();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const progress = progressRef.current;

    const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, itemType: keyof typeof splitItems) => {
      if (!ref.current) return;
      const list = splitItems[itemType];
      
      // Access materials to update glow
      const material = ref.current.material as THREE.MeshStandardMaterial;
      if (material.emissiveIntensity !== undefined) {
        // Glow is stronger in FORMED state (progress close to 0)
        material.emissiveIntensity = THREE.MathUtils.lerp(0.8, 0.1, progress) + Math.sin(t * 2) * 0.1;
      }

      list.forEach((item, i) => {
        const weightMod = 1.0 - (item.weight * 0.3);
        const p = Math.pow(progress, weightMod);
        
        v1.set(...item.target);
        v2.set(...item.chaos);
        const pos = new THREE.Vector3().lerpVectors(v1, v2, p);

        // CHAOS Effects: Wobble
        if (progress > 0.01) {
            const wobbleSpeed = 8.0;
            const wobbleAmount = 0.15 * progress;
            pos.x += Math.sin(t * wobbleSpeed + i) * wobbleAmount;
            pos.y += Math.cos(t * (wobbleSpeed * 0.8) + i) * wobbleAmount;
            pos.z += Math.sin(t * (wobbleSpeed * 1.2) + i * 0.5) * wobbleAmount;
            
            dummy.rotation.set(
              t * (1.5 + i * 0.1) * progress,
              t * 1.2 * progress,
              Math.sin(t + i) * 0.5 * progress
            );
        } else {
            // FORMED: subtle breathing motion
            pos.y += Math.sin(t * 0.5 + i) * 0.02;
            dummy.rotation.set(0, t * 0.2, 0);
        }

        dummy.position.copy(pos);
        const baseScale = itemType === 'gift' ? 0.35 : itemType === 'ball' ? 0.25 : 0.12;
        // Subtle scale pulse in Formed
        const scaleMod = 1 + (1 - progress) * Math.sin(t * 1.5 + i) * 0.05;
        dummy.scale.setScalar(baseScale * scaleMod);
        
        dummy.updateMatrix();
        ref.current?.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(giftsRef, 'gift');
    updateMesh(ballsRef, 'ball');
    updateMesh(lightsRef, 'light');

    // Update particles for Chaos state
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      items.forEach((item, i) => {
        const weightMod = 1.0 - (item.weight * 0.3);
        const p = Math.pow(progress, weightMod);
        
        v1.set(...item.target);
        v2.set(...item.chaos);
        const center = new THREE.Vector3().lerpVectors(v1, v2, p);

        for (let j = 0; j < 10; j++) {
          const idx = (i * 10 + j) * 3;
          const offset = j * 0.5;
          // Particles only spread out and become visible as chaos increases
          const spread = progress * 1.5;
          positions[idx] = center.x + Math.sin(t * 2 + i + offset) * spread;
          positions[idx + 1] = center.y + Math.cos(t * 3 + i + offset) * spread;
          positions[idx + 2] = center.z + Math.sin(t * 1.5 + i + offset) * spread;
        }
      });
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = progress * 0.6;
    }
  });

  return (
    <>
      <instancedMesh ref={giftsRef} args={[new THREE.BoxGeometry(1, 1, 1), null, splitItems.gift.length]} castShadow>
        <meshStandardMaterial 
          color="#8B0000" 
          metalness={0.6} 
          roughness={0.2} 
          emissive="#400" 
          emissiveIntensity={0.2}
        />
      </instancedMesh>
      
      <instancedMesh ref={ballsRef} args={[new THREE.SphereGeometry(1, 24, 24), null, splitItems.ball.length]} castShadow>
        <meshStandardMaterial 
          color={COLORS.GOLD_LUXURY} 
          metalness={1.0} 
          roughness={0.1} 
          emissive={COLORS.GOLD_LUXURY} 
          emissiveIntensity={0.5}
        />
      </instancedMesh>
      
      <instancedMesh ref={lightsRef} args={[new THREE.SphereGeometry(1, 12, 12), null, splitItems.light.length]}>
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF" 
          emissiveIntensity={2} 
        />
      </instancedMesh>

      {/* Chaos Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particleData.positions.length / 3} 
            array={particleData.positions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.08} 
          color={COLORS.GOLD_BRIGHT} 
          transparent 
          opacity={0} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
};

export default Ornaments;
