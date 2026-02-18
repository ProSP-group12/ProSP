import React, { useEffect, useRef, useState } from 'react';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import { DetectedObject } from './src/services/objectDetection';
import { sendToImageRecognitionAPI } from './src/services/imageRecognitionAPI';

type CapturedData = {
  photo: any;
  photoPath: string;
  objects: DetectedObject[];
};


function AppInner() {
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);

  const handleCapture = async (data: { photo: any; photoPath: string; objects: DetectedObject[] }) => {
    const photoPath = data.photoPath;

    // 先显示照片，清空对象数组
    setCapturedData({ photo: data.photo, photoPath, objects: [] });

    try {
      const uri = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;
      const apiResults = await sendToImageRecognitionAPI({ uri });

      const objects: DetectedObject[] = apiResults.map(r => ({
        label: r.name,
        confidence: Number(r.confidence) / 100,
        bounds: { x: 0, y: 0, width: 0, height: 0 },
      }));

      setCapturedData({ photo: data.photo, photoPath, objects });
    } catch (e) {
      console.error('API recognition error:', e);
      setCapturedData({ photo: data.photo, photoPath, objects: [] });
    }
  };

  const handleBack = () => setCapturedData(null);

  return capturedData ? (
    <ResultScreen photoPath={capturedData.photoPath} objects={capturedData.objects} onBack={handleBack} />
  ) : (
    <CameraScreen onCapture={handleCapture} />
  );
}

export default function App() {
  const appId = useRef(Math.random().toString(16).slice(2));
  useEffect(() => {
    console.log('APP MOUNT id=', appId.current);
    return () => console.log('APP UNMOUNT id=', appId.current);
  }, []);

  return <AppInner />;
}
