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
  const [recognizing, setRecognizing] = useState(false);

  const handleCapture = async (data: { photo: any; photoPath: string }) => {
    const photoPath = data.photoPath;
    setRecognizing(true);

    // 先把图片显示出来，objects 先空
    setCapturedData({ photo: data.photo, photoPath, objects: [] });

    try {
      const uri = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

      // ✅ 关键：API 直接返回 [{label, finnish, chinese, confidence}]，我们直接用
      const apiResults: DetectedObject[] = await sendToImageRecognitionAPI({ uri });

      setCapturedData({ photo: data.photo, photoPath, objects: apiResults });
    } catch (e) {
      console.error('API recognition error:', e);
      setCapturedData({ photo: data.photo, photoPath, objects: [] });
    } finally {
      setRecognizing(false);
    }
  };

  const handleBack = () => {
    setCapturedData(null);
    setRecognizing(false);
  };

  return capturedData ? (
    <ResultScreen
      photoPath={capturedData.photoPath}
      objects={capturedData.objects}
      onBack={handleBack}
      recognizing={recognizing}
    />
  ) : (
    <CameraScreen
      onCapture={(data) => handleCapture({ photo: data.photo, photoPath: data.photoPath })}
    />
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
