declare module 'vision-camera-object-detection' {
  import { Frame } from 'react-native-vision-camera';
  interface DetectedObject {
    boundingBox: { origin: { x: number; y: number }; size: { width: number; height: number } };
    labels: Array<{ text: string; confidence: number }>;
    trackingId?: number;
  }
  export function detectObject(frame: Frame): DetectedObject[];
}