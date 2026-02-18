import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { detectObject } from 'vision-camera-object-detection';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import { mapMLKitObjects, DetectedObject } from '../services/objectDetection';
import { throttle } from '../utils/throttle';

interface Props {
  onCapture: (data: { photo: any; objects: DetectedObject[] }) => void;
}

const CameraScreen: React.FC<Props> = ({ onCapture }) => {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  const [hasPermission, setHasPermission] = useState(false);
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });

  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      // compatible with different vision-camera versions
      setHasPermission(status !== 'denied');
    })();
  }, []);

  const handleDetection = useRef(
    throttle((mlkitObjs: any[], fW: number, fH: number) => {
      const mapped = mapMLKitObjects(mlkitObjs);
      setObjects(mapped);
      setFrameSize({ width: fW, height: fH });
    }, 300)
  ).current;

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detected = detectObject(frame);
    // always pass an array to JS side (avoid type issues)
    runOnJS(handleDetection)(detected ?? [], frame.width, frame.height);
  }, [handleDetection]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewSize({ width, height });
  };

  const handleCapturePress = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePhoto(); // no extra options for compatibility
    onCapture({ photo, objects });
  };

  if (device == null) return <Text>Loading camera...</Text>;
  if (!hasPermission) return <Text>Camera permission denied.</Text>;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      <BoundingBoxOverlay
        objects={objects}
        frameWidth={frameSize.width}
        frameHeight={frameSize.height}
        viewWidth={viewSize.width}
        viewHeight={viewSize.height}
      />

      <TouchableOpacity style={styles.captureButton} onPress={handleCapturePress}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
});

export default CameraScreen;
