import React, { useState } from 'react';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import { DetectedObject } from './src/services/objectDetection';

export default function App() {
  const [capturedData, setCapturedData] = useState<{
  photo: any;
  photoPath: string;
  objects: DetectedObject[];
} | null>(null);

  const handleCapture = (data: {
  photo: any;
  photoPath: string;
  objects: DetectedObject[];
}) => {
  setCapturedData(data);
};

  const handleBack = () => {
    setCapturedData(null);
  };

  return capturedData ? (
  <ResultScreen
    photoPath={capturedData.photoPath}
    objects={capturedData.objects}
    onBack={handleBack}
  />
) : (
  <CameraScreen onCapture={handleCapture} />
);
}
