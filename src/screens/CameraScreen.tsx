import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import { DetectedObject } from '../services/objectDetection';

interface Props {
  onCapture: (data: {
    photo: any;
    photoPath: string;
    objects: DetectedObject[];
  }) => void;
}

const CameraScreen: React.FC<Props> = ({ onCapture }) => {
  const devices = useCameraDevices();
  // vision-camera v2: devices is an array; pick the back one
  const device = devices.find((d) => d.position === 'back');

  const [hasPermission, setHasPermission] = useState(false);

  // Keep overlay pipeline intact, but we won't produce objects for now
  const [objects] = useState<DetectedObject[]>([]);
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });

  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      // Some versions return 'authorized'|'denied', some return other strings
      setHasPermission(status !== 'denied');
    })();
  }, []);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewSize({ width, height });

    // We don't have real frame size without frameProcessor.
    // Set a reasonable default so overlay math doesn't divide by zero.
    // (If your BoundingBoxOverlay already guards, this is still safe.)
    if (frameSize.width === 1 && frameSize.height === 1) {
      setFrameSize({ width, height });
    }
  };

  const handleCapturePress = async () => {
  if (!cameraRef.current) return;

  const photo = await cameraRef.current.takePhoto();
  const photoPath = photo.path;

  onCapture({ photo, photoPath, objects });
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
        photo={true}
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
