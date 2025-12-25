
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { TreeState, HandData } from './types';
import Experience from './components/Experience';
import HandTracker from './components/HandTracker';
import { COLORS } from './constants';
import { TreePine, Sparkles as SparklesIcon, Hand } from 'lucide-react';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handData, setHandData] = useState<HandData>({ isOpen: false, x: 0, y: 0, isDetected: false });

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
    if (data.isDetected) {
      setTreeState(data.isOpen ? TreeState.CHAOS : TreeState.FORMED);
    }
  }, []);

  const toggleState = (state: TreeState) => {
    setTreeState(state);
  };

  const getInstruction = () => {
    if (!handData.isDetected) {
      return {
        main: "Show hand to camera",
        sub: "Enter the cosmic gala",
        icon: <Hand size={14} className="animate-bounce" />
      };
    }
    if (treeState === TreeState.FORMED) {
      return {
        main: "Open hand for surprise",
        sub: "Release the hidden magic",
        icon: <SparklesIcon size={14} className="text-yellow-400" />
      };
    }
    return {
      main: "Close hand to restore",
      sub: "Return to perfection",
      icon: <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
    };
  };

  const instruction = getInstruction();

  return (
    <div className="w-full h-screen bg-[#000504] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] z-10 opacity-80" />

      {/* 3D Scene */}
      <Canvas shadows gl={{ antialias: false, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 5, 30]} fov={40} />
        
        <color attach="background" args={['#000504']} />
        <fog attach="fog" args={['#000504', 15, 65]} />

        <Environment preset="night" />
        
        <Stars radius={100} depth={50} count={10000} factor={4} saturation={0.5} fade speed={1} />
        <Sparkles count={500} scale={30} size={1.5} speed={0.3} color={COLORS.GOLD_BRIGHT} opacity={0.5} />

        <pointLight position={[50, 50, -50]} intensity={1} color="#4b0082" />
        <pointLight position={[0, 15, 10]} intensity={2.5} color={COLORS.GOLD_BRIGHT} />
        <spotLight position={[0, 25, 10]} angle={0.2} penumbra={1} intensity={3} castShadow />

        <Experience 
          treeState={treeState} 
          handData={handData} 
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.7} mipmapBlur intensity={1.5} radius={0.3} />
          <Noise opacity={0.08} />
          <Vignette eskil={false} offset={0.05} darkness={1.2} />
        </EffectComposer>

        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={50} 
          maxPolarAngle={Math.PI / 1.7}
          target={[0, 0, 0]}
          autoRotate={treeState === TreeState.FORMED}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Header UI */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start pointer-events-none z-20">
        <div className="transition-all duration-700">
          <h1 className="luxury-text text-2xl md:text-4xl text-[#D4AF37] font-bold tracking-[0.3em] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-3">
            <TreePine size={32} className="text-[#FFD700]" />
            MERRY CHRISTMAS
          </h1>
          <p className="text-[#D4AF37]/40 italic mt-1 text-xs md:text-sm tracking-[0.2em]">A little present to you</p>
          
          <div className="mt-5 flex items-center pointer-events-auto scale-90 origin-left">
            <div className="flex bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 p-1">
              <button 
                onClick={() => toggleState(TreeState.FORMED)}
                className={`px-5 py-1 rounded-full luxury-text text-[9px] tracking-[0.2em] uppercase transition-all duration-500 ${treeState === TreeState.FORMED ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-500/20' : 'text-[#D4AF37]/40 hover:text-[#D4AF37]'}`}
              >
                Formed
              </button>
              <button 
                onClick={() => toggleState(TreeState.CHAOS)}
                className={`px-5 py-1 rounded-full luxury-text text-[9px] tracking-[0.2em] uppercase transition-all duration-500 ${treeState === TreeState.CHAOS ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-500/20' : 'text-[#D4AF37]/40 hover:text-[#D4AF37]'}`}
              >
                Chaos
              </button>
            </div>
            <span className="ml-3 text-[#D4AF37]/20 text-[8px] uppercase tracking-widest hidden md:block">Manual Toggle</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Contextual HUD */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-xs text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-700 ease-out">
            {instruction.icon}
            <div className="flex flex-col text-left">
              <span className="luxury-text text-[#D4AF37] text-[10px] tracking-[0.15em] uppercase whitespace-nowrap">
                {instruction.main}
              </span>
              <span className="text-[#D4AF37]/40 text-[8px] tracking-[0.1em] uppercase font-light leading-tight">
                {instruction.sub}
              </span>
            </div>
          </div>
          {handData.isDetected && (
            <div className="flex items-center gap-1.5 opacity-30">
               <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
               <span className="text-[7px] text-emerald-400 tracking-widest uppercase font-bold">AI Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Tiny Camera Preview */}
      <div className="absolute bottom-4 right-4 w-28 h-20 md:w-36 md:h-26 bg-black/80 backdrop-blur-xl rounded-lg border border-white/5 overflow-hidden z-30 shadow-2xl opacity-50 hover:opacity-100 transition-all duration-500">
        <HandTracker onUpdate={handleHandUpdate} />
      </div>
    </div>
  );
};

export default App;
