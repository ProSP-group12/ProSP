import React, { useEffect, useMemo, useRef, useState } from 'react';
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

// ✅ 全局缓存权限，防止 dev reload 导致闪烁
let cachedCameraPermission: boolean | null = null;

const CameraScreen: React.FC<Props> = ({ onCapture }) => {
  console.log('CameraScreen RENDER');

  const devices = useCameraDevices();

  const device = useMemo(() => {
    return devices.find((d) => d.position === 'back');
  }, [devices]);

  const cameraRef = useRef<Camera>(null);

  const [permissionReady, setPermissionReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const [objects] = useState<DetectedObject[]>([]);
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });

  // ✅ 监控挂载卸载
  useEffect(() => {
    console.log('CameraScreen MOUNT');
    return () => console.log('CameraScreen UNMOUNT');
  }, []);

  // ✅ 权限逻辑
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 如果之前已经授权过，直接通过
      if (cachedCameraPermission === true) {
        if (!cancelled) {
          setHasPermission(true);
          setPermissionReady(true);
        }
        return;
      }

      try {
        const current: any = await Camera.getCameraPermissionStatus();
        console.log('Permission status:', current);

        let ok = true;

        if (current === 'denied' || current === 'restricted') {
          const requested: any = await Camera.requestCameraPermission();
          console.log('Requested permission:', requested);
          ok = !(requested === 'denied' || requested === 'restricted');
        }

        cachedCameraPermission = ok;

        if (!cancelled) {
          setHasPermission(ok);
        }
      } catch (e) {
        console.warn('Camera permission error:', e);
        cachedCameraPermission = false;
        if (!cancelled) setHasPermission(false);
      } finally {
        if (!cancelled) setPermissionReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewSize({ width, height });

    if (frameSize.width === 1 && frameSize.height === 1) {
      setFrameSize({ width, height });
    }
  };

  const handleCapturePress = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto();
      onCapture({
        photo,
        photoPath: photo.path,
        objects,
      });
    } catch (e) {
      console.warn('takePhoto failed:', e);
    }
  };

  // 等权限检查完成
  if (!permissionReady) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>
          Camera permission denied.{"\n"}
          Please enable Camera permission in Settings.
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>Loading camera device...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => {
          console.log('Camera initialized');
        }}
        onError={(e) => {
          console.warn('Camera error:', e);
        }}
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
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', lineHeight: 22 },

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
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
});

export default CameraScreen;
