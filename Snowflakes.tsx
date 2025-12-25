
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SETTINGS, COLORS } from '../constants';

interface SnowflakesProps {
  progressRef: React.MutableRefObject<number>;
}

const SNOW_COUNT = 2000;

const Snowflakes: React.FC<SnowflakesProps> = ({ progressRef }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Initialize particle data
  const { positions, velocities, branchPositions, phase } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const vel = new Float32Array(SNOW_COUNT * 3);
    const branchPos = new Float32Array(SNOW_COUNT * 3);
    const ph = new Float32Array(SNOW_COUNT);

    for (let i = 0; i < SNOW_COUNT; i++) {
      // Air position (Initial random box)
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 40 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Velocity (Gentle drift)
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = -(Math.random() * 0.05 + 0.02);
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Branch position (Target for accumulation)
      const h = Math.random() * SETTINGS.TREE_HEIGHT;
      const r = (1 - h / SETTINGS.TREE_HEIGHT) * SETTINGS.TREE_RADIUS * 1.1; // Slightly outside
      const theta = Math.random() * Math.PI * 2;
      branchPos[i * 3] = Math.cos(theta) * r;
      branchPos[i * 3 + 1] = h;
      branchPos[i * 3 + 2] = Math.sin(theta) * r;

      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, velocities: vel, branchPositions: branchPos, phase: ph };
  }, []);

  const tempPos = new THREE.Vector3();
  const tempBranch = new THREE.Vector3();

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const p = progressRef.current; // 0 = FORMED, 1 = CHAOS
    const time = state.clock.elapsedTime;

    for (let i = 0; i < SNOW_COUNT; i++) {
      const idx = i * 3;
      
      // Basic falling logic
      positions[idx] += velocities[idx];
      positions[idx + 1] += velocities[idx + 1];
      positions[idx + 2] += velocities[idx + 2];

      // Wrap around box
      if (positions[idx + 1] < -15) positions[idx + 1] = 25;
      if (Math.abs(positions[idx]) > 25) positions[idx] *= -0.9;
      if (Math.abs(positions[idx + 2]) > 25) positions[idx + 2] *= -0.9;

      // Current "Air" position
      tempPos.set(positions[idx], positions[idx + 1], positions[idx + 2]);
      
      // Target "Branch" position
      tempBranch.set(branchPositions[idx], branchPositions[idx + 1], branchPositions[idx + 2]);

      // State Influence
      if (p < 0.5) {
        // FORMED: Accumulate on branches
        // Only attract if reasonably close to create a "settling" look
        const attractionStrength = (1 - p) * 0.15;
        const distToBranch = tempPos.distanceTo(tempBranch);
        
        if (distToBranch < 8) {
          tempPos.lerp(tempBranch, attractionStrength);
        }
        
        // Add a bit of sparkle/jiggle when "stuck"
        const jiggle = Math.sin(time * 2 + phase[i]) * 0.005;
        tempPos.x += jiggle;
        tempPos.z += jiggle;

      } else {
        // CHAOS: Disperse wildly
        const dispersionStrength = (p - 0.5) * 2;
        const radialDir = tempPos.clone().normalize();
        // Blow away from center Y axis
        radialDir.y = 0.2; // Add upward drift in chaos
        tempPos.addScaledVector(radialDir, dispersionStrength * 0.1);
        
        // Add turbulent noise
        tempPos.x += Math.sin(time * 5 + i) * 0.05 * dispersionStrength;
        tempPos.y += Math.cos(time * 4 + i) * 0.05 * dispersionStrength;
        tempPos.z += Math.sin(time * 6 + i) * 0.05 * dispersionStrength;
      }

      posAttr.array[idx] = tempPos.x;
      posAttr.array[idx + 1] = tempPos.y;
      posAttr.array[idx + 2] = tempPos.z;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={new Float32Array(SNOW_COUNT * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={COLORS.WHITE_SOFT}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Snowflakes;
