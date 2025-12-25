
import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';

interface HandTrackerProps {
  onUpdate: (data: HandData) => void;
}

// Access globals from window
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cameraInstance: any = null;
    let handsInstance: any = null;

    const initMediaPipe = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Ensure MediaPipe is loaded from the window object
        const HandsClass = window.Hands;
        const CameraClass = window.Camera;

        if (!HandsClass || !CameraClass) {
          setError("MediaPipe libraries not loaded. Please refresh.");
          return;
        }

        handsInstance = new HandsClass({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
          }
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        handsInstance.onResults((results: any) => {
          if (!canvasRef.current) return;
          setIsInitializing(false);

          const canvasCtx = canvasRef.current.getContext('2d');
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Logic: Calculate distance from palm center (0) to finger tips
            const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            
            const palm = landmarks[0];
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];
            
            // Average distance of the 4 main fingers to the palm base
            const avgDist = (
              getDist(palm, indexTip) + 
              getDist(palm, middleTip) + 
              getDist(palm, ringTip) + 
              getDist(palm, pinkyTip)
            ) / 4;
            
            // Threshold for "open" hand: fingers significantly away from palm
            const isOpen = avgDist > 0.32; 
            
            onUpdate({
              isOpen,
              x: palm.x,
              y: palm.y,
              isDetected: true
            });

            // Draw visual feedback dots
            canvasCtx.fillStyle = isOpen ? '#FFD700' : '#043927';
            landmarks.forEach((point: any) => {
               canvasCtx.beginPath();
               canvasCtx.arc(point.x * canvasRef.current!.width, point.y * canvasRef.current!.height, 2, 0, 2 * Math.PI);
               canvasCtx.fill();
            });
          } else {
            onUpdate({ isOpen: false, x: 0.5, y: 0.5, isDetected: false });
          }
          canvasCtx.restore();
        });

        cameraInstance = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (handsInstance && videoRef.current) {
              await handsInstance.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await cameraInstance.start();
      } catch (err) {
        console.error("Camera failed to start:", err);
        setError("Camera access denied or unavailable.");
      }
    };

    initMediaPipe();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (handsInstance) handsInstance.close();
    };
  }, [onUpdate]);

  return (
    <div className="relative w-full h-full bg-[#011a12] flex items-center justify-center">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" width={320} height={240} />
      
      {isInitializing && !error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-[10px] text-[#D4AF37] uppercase tracking-tighter">Waking AI...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-950/90 flex items-center justify-center p-4 text-center">
          <span className="text-[10px] text-white uppercase tracking-tighter leading-tight">{error}</span>
        </div>
      )}

      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-[10px] text-[#D4AF37] uppercase rounded border border-[#D4AF37]/30">
        Vision Input
      </div>
    </div>
  );
};

export default HandTracker;
