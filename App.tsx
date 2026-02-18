import React, { useState } from 'react';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import { DetectedObject } from './src/services/objectDetection';
import { sendToImageRecognitionAPI } from './src/services/imageRecognitionAPI';

type CapturedData = {
  photo: any;
  photoPath: string;
  objects: DetectedObject[];
};

export default function App() {
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (data: { photo: any; photoPath: string; objects: DetectedObject[] }) => {
    const photoPath = data.photoPath;

    // 先把“照片”显示出来（即使识别还没返回）
    setCapturedData({ ...data, objects: [] });

    // 开始识别
    setIsProcessing(true);
    try {
      // imageRecognitionAPI 需要 { uri }
      const uri = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;
      const apiResults = await sendToImageRecognitionAPI({ uri });

      // apiResults 格式: [{ name, finnish, chinese, confidence }] (confidence是字符串百分比)
      // 这里映射成你项目的 DetectedObject
      const objects: DetectedObject[] = (apiResults || []).map((r: any) => ({
        label: r.name ?? 'Unknown',
        confidence: typeof r.confidence === 'string' ? Number(r.confidence) / 100 : (r.confidence ?? 0),
        bounds: { x: 0, y: 0, width: 0, height: 0 }, // 结果页不需要框，先占位
      }));

      setCapturedData({ photo: data.photo, photoPath, objects });
    } catch (e) {
      console.error('Recognition failed:', e);
      // 保持照片显示，objects为空
      setCapturedData({ photo: data.photo, photoPath, objects: [] });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => setCapturedData(null);

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
