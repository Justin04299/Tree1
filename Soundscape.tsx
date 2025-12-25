
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';

interface SoundscapeProps {
  treeState: TreeState;
  isMuted: boolean;
  audioEnabled: boolean;
  progressRef: React.MutableRefObject<number>;
}

const Soundscape: React.FC<SoundscapeProps> = ({ treeState, isMuted, audioEnabled, progressRef }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const twinkleGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const oscRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!audioEnabled || audioCtxRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Ambient Pad (Soft Celestial Music)
    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(ctx.destination);
    ambientGainRef.current = ambientGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.connect(ambientGain);
    filterRef.current = filter;

    // Creating a simple additive ambient pad
    const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      oscGain.gain.value = 0.05;
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscRef.current.push(osc);
    });

    // Twinkle SFX Gain
    const twinkleGain = ctx.createGain();
    twinkleGain.gain.value = 0;
    twinkleGain.connect(ctx.destination);
    twinkleGainRef.current = twinkleGain;

    return () => {
      ctx.close();
    };
  }, [audioEnabled]);

  useFrame((state) => {
    if (!audioCtxRef.current || !ambientGainRef.current || !twinkleGainRef.current || !filterRef.current) return;

    const p = progressRef.current; // 0 = FORMED, 1 = CHAOS
    const targetVolume = isMuted ? 0 : 0.4;
    
    // Smoothly transition ambient volume and filter
    ambientGainRef.current.gain.setTargetAtTime(targetVolume, audioCtxRef.current.currentTime, 0.1);
    
    // During CHAOS, the sound becomes "brighter" (more harmonics)
    filterRef.current.frequency.setTargetAtTime(1000 + p * 4000, audioCtxRef.current.currentTime, 0.2);

    // Random twinkles based on progress
    if (!isMuted && Math.random() < (0.05 + p * 0.2)) {
      playTwinkle(audioCtxRef.current, twinkleGainRef.current, p);
    }
  });

  const playTwinkle = (ctx: AudioContext, destination: AudioNode, progress: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    
    osc.type = 'triangle';
    // Higher pitches during chaos
    osc.frequency.setValueAtTime(1500 + Math.random() * 3000 + progress * 2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);

    g.gain.setValueAtTime(0.05 + progress * 0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(g);
    g.connect(destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  return null;
};

export default Soundscape;
