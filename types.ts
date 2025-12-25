
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface PositionData {
  chaos: [number, number, number];
  target: [number, number, number];
}

export interface OrnamentData extends PositionData {
  type: 'gift' | 'ball' | 'light' | 'polaroid';
  color: string;
  weight: number;
  imageUrl?: string;
}

export interface HandData {
  isOpen: boolean;
  x: number;
  y: number;
  isDetected: boolean;
}
