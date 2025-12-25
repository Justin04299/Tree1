
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Mail } from 'lucide-react';

interface ChristmasLetterProps {
  progressRef: React.MutableRefObject<number>;
}

const ChristmasLetter: React.FC<ChristmasLetterProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const p = progressRef.current; // 0 = Formed, 1 = Chaos
    const t = state.clock.elapsedTime;

    // The letter flows from "inside" the tree towards the user
    // targetZ = 8 brings it closer to the camera (which is at z=18 in Chaos)
    const targetZ = -5 + p * 13; 
    // vertical centering: Experience is at y=-6, so y=6 makes it y=0 in world space
    const targetY = 6 + Math.sin(t * 0.8) * 0.3; 
    const targetScale = p;
    // Less rotation on mobile/smaller scales to keep it legible
    const targetRotation = Math.sin(t * 0.5) * 0.03 * p;

    groupRef.current.position.set(0, targetY, targetZ);
    groupRef.current.scale.setScalar(targetScale);
    groupRef.current.rotation.z = targetRotation;
    groupRef.current.rotation.y = Math.cos(t * 0.3) * 0.04 * p;
  });

  const glowIntensity = progressRef.current;
  const pulseScale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
  const wiggleRotation = Math.sin(Date.now() * 0.003) * 5; // Subtle wiggle for the seal

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={10}
        transform
        sprite
        style={{
          transition: 'opacity 0.6s ease-out',
          opacity: progressRef.current > 0.05 ? 1 : 0,
          pointerEvents: progressRef.current > 0.8 ? 'auto' : 'none',
        }}
      >
        <div className="relative group">
          {/* Dynamic Glow Effect */}
          <div 
            className="absolute inset-0 rounded-sm blur-3xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, rgba(212, 175, 55, ${0.35 * glowIntensity}) 0%, transparent 70%)`,
              opacity: glowIntensity,
              transform: `scale(${1.3 * pulseScale})`,
              zIndex: -1
            }}
          />
          
          <div 
            className="w-[280px] sm:w-[350px] md:w-[450px] bg-[#fdfaf1] p-6 sm:p-8 md:p-12 rounded-sm border-[1px] border-[#d4af37]/40 relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
            style={{
                boxShadow: `0 0 ${40 * glowIntensity}px rgba(212, 175, 55, ${0.15 * glowIntensity})`
            }}
          >
            {/* Decorative Corner Elements - responsive sizes */}
            <div className="absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 border-t-[1px] border-r-[1px] border-[#d4af37]/30 m-2 md:m-3" />
            <div className="absolute bottom-0 left-0 w-12 h-12 md:w-20 md:h-20 border-b-[1px] border-l-[1px] border-[#d4af37]/30 m-2 md:m-3" />
            
            {/* Elegant Red Wax Seal Icon with Animation */}
            <div 
              className="mb-4 sm:mb-6 md:mb-8 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-[#8b0000] rounded-full shadow-lg border-2 border-[#a00] relative transition-transform duration-300 ease-out"
              style={{ 
                transform: `rotate(${wiggleRotation}deg) scale(${1 + 0.1 * glowIntensity})`,
              }}
            >
              <Mail size={18} className="text-[#ffd700] md:hidden drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
              <Mail size={24} className="text-[#ffd700] hidden md:block drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
              
              <div 
                className="absolute -inset-2 border border-[#8b0000]/30 rounded-full animate-pulse" 
                style={{ opacity: glowIntensity }}
              />
              {/* Shimmer effect on seal */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" 
                style={{ opacity: glowIntensity }}
              />
            </div>

            <h3 className="luxury-text text-[#8b0000] text-lg sm:text-xl md:text-3xl mb-4 sm:mb-6 md:mb-8 tracking-[0.2em] md:tracking-[0.25em] font-bold border-b border-[#d4af37]/30 pb-4 md:pb-6 w-full">
              MERRY CHRISTMAS
            </h3>

            <div className="space-y-3 sm:space-y-4 md:space-y-6 font-serif italic text-gray-800 text-[13px] sm:text-sm md:text-lg leading-relaxed antialiased">
              <p className="text-left font-bold text-[#d4af37] text-sm md:text-xl not-italic">Dear Friend,</p>
              <p className="drop-shadow-sm">
                Merry Christmas! I hope you are doing well and continue to perform better :D 
              </p>
              <p className="drop-shadow-sm">
                So glad to have you in my life.
              </p>
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10 pt-6 md:pt-8 border-t border-[#d4af37]/20 w-full flex flex-col items-center gap-1 md:gap-2">
               <span className="luxury-text text-[8px] md:text-[11px] text-[#d4af37] tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold">
                 With Love & Cosmic Magic
               </span>
               <div className="w-8 md:w-12 h-[1px] bg-[#d4af37]/30" />
            </div>
            
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          </div>
        </div>
      </Html>
    </group>
  );
};

export default ChristmasLetter;
