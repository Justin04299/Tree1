
import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, HandData, OrnamentData } from '../types';
import { SETTINGS, COLORS } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroids from './Polaroids';
import TreeTopStar from './TreeTopStar';
import Snowflakes from './Snowflakes';
import ChristmasLetter from './ChristmasLetter';

interface ExperienceProps {
  treeState: TreeState;
  handData: HandData;
}

// Local lerp helper in case MathUtils is weird
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Experience: React.FC<ExperienceProps> = ({ treeState, handData }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const lerpProgressRef = useRef(0);

  // Generate ornament and foliage data
  const ornaments = useMemo(() => {
    const items: OrnamentData[] = [];
    const types: ('gift' | 'ball' | 'light')[] = ['gift', 'ball', 'light'];
    
    for (let i = 0; i < SETTINGS.ORNAMENT_COUNT; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      
      const h = Math.random() * SETTINGS.TREE_HEIGHT;
      const r = (1 - h / SETTINGS.TREE_HEIGHT) * SETTINGS.TREE_RADIUS * (0.4 + Math.random() * 0.6);
      const theta = Math.random() * Math.PI * 2;
      
      const target: [number, number, number] = [
        Math.cos(theta) * r,
        h,
        Math.sin(theta) * r
      ];

      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      const cR = SETTINGS.CHAOS_RADIUS * (0.5 + Math.random() * 0.5);
      
      const chaos: [number, number, number] = [
        cR * Math.sin(cPhi) * Math.cos(cTheta),
        cR * Math.sin(cPhi) * Math.sin(cTheta) + 5,
        cR * Math.cos(cPhi)
      ];

      items.push({
        type,
        chaos,
        target,
        color: i % 2 === 0 ? COLORS.GOLD_LUXURY : COLORS.RED_LUXURY,
        weight: type === 'gift' ? 1.0 : type === 'ball' ? 0.6 : 0.2
      });
    }
    return items;
  }, []);

  const foliagePositions = useMemo(() => {
    const chaos = new Float32Array(SETTINGS.FOLIAGE_COUNT * 3);
    const target = new Float32Array(SETTINGS.FOLIAGE_COUNT * 3);

    for (let i = 0; i < SETTINGS.FOLIAGE_COUNT; i++) {
      const h = Math.pow(Math.random(), 1.2) * SETTINGS.TREE_HEIGHT;
      const r = (1 - h / SETTINGS.TREE_HEIGHT) * SETTINGS.TREE_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      
      target[i * 3] = Math.cos(theta) * r;
      target[i * 3 + 1] = h;
      target[i * 3 + 2] = Math.sin(theta) * r;

      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      const cR = SETTINGS.CHAOS_RADIUS * (0.3 + Math.random() * 0.7);
      
      chaos[i * 3] = cR * Math.sin(cPhi) * Math.cos(cTheta);
      chaos[i * 3 + 1] = cR * Math.sin(cPhi) * Math.sin(cTheta) + 5;
      chaos[i * 3 + 2] = cR * Math.cos(cPhi);
    }
    return { chaos, target };
  }, []);

  useFrame((state, delta) => {
    const targetValue = treeState === TreeState.CHAOS ? 1 : 0;
    
    // Safely update progress using local lerp
    lerpProgressRef.current = lerp(lerpProgressRef.current, targetValue, Math.min(delta * 2.5, 1));

    // DYNAMIC ZOOM: zoom in slightly less when the letter is present to keep it in frame
    const targetZ = lerp(30, 18, lerpProgressRef.current);
    camera.position.z = lerp(camera.position.z, targetZ, Math.min(delta * 2.0, 1));
    
    // Always center the view on the tree's midpoint
    camera.lookAt(0, 0, 0);

    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1 * (1 - lerpProgressRef.current);
    }
  });

  return (
    <group ref={groupRef} position={[0, -6, 0]}>
      <Snowflakes progressRef={lerpProgressRef} />
      <Foliage data={foliagePositions} progressRef={lerpProgressRef} />
      <Ornaments items={ornaments} progressRef={lerpProgressRef} />
      <Polaroids count={SETTINGS.POLAROID_COUNT} progressRef={lerpProgressRef} />
      <TreeTopStar progressRef={lerpProgressRef} />
      <ChristmasLetter progressRef={lerpProgressRef} />
      
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 1.5, 32]} />
        <meshStandardMaterial color="#1a0f06" metalness={0.8} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[6, 8, 0.2, 64]} />
        <meshStandardMaterial color={COLORS.GOLD_LUXURY} metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
};

export default Experience;
