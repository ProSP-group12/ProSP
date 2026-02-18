import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, Image } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import { DetectedObject } from '../services/objectDetection';

interface Props {
  onCapture: (data: { photo: any; photoPath: string }) => void;
}

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

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const handleCapturePress = async () => {
  if (!cameraRef.current) return;

  try {
    const photo = await cameraRef.current.takePhoto();

    const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;

    // 读取真实 bitmap 尺寸（关键）
    const { imgW, imgH } = await new Promise<{ imgW: number; imgH: number }>((resolve, reject) => {
      Image.getSize(
        uri,
        (w, h) => resolve({ imgW: w, imgH: h }),
        (err) => reject(err)
      );
    });

    const screenW = viewSize.width;
    const screenH = viewSize.height;

    // 图片在屏幕上的 fit-center 显示区域（按真实尺寸算）
    const scale = Math.min(screenW / imgW, screenH / imgH);
    const displayW = imgW * scale;
    const displayH = imgH * scale;
    const offsetX = (screenW - displayW) / 2;
    const offsetY = (screenH - displayH) / 2;

    // viewfinder 在屏幕坐标
    const vfScreen = {
      left: 0.15 * screenW,
      top: 0.3 * screenH,
      width: 0.7 * screenW,
      height: 0.4 * screenH,
    };

    // 屏幕 -> 图片坐标
    let cropLeft = (vfScreen.left - offsetX) / scale;
    let cropTop = (vfScreen.top - offsetY) / scale;
    let cropWidth = vfScreen.width / scale;
    let cropHeight = vfScreen.height / scale;

    // 先 clamp（浮点阶段）
    cropLeft = clamp(cropLeft, 0, imgW);
    cropTop = clamp(cropTop, 0, imgH);
    cropWidth = clamp(cropWidth, 1, imgW - cropLeft);
    cropHeight = clamp(cropHeight, 1, imgH - cropTop);

    // 再取整（建议用 floor/ceil 更稳）
    let originX = Math.floor(cropLeft);
    let originY = Math.floor(cropTop);
    let width = Math.floor(cropWidth);
    let height = Math.floor(cropHeight);

    // ⭐ 取整后必须再 clamp 一次，防止 +1 越界
    originX = clamp(originX, 0, imgW - 1);
    originY = clamp(originY, 0, imgH - 1);
    width = clamp(width, 1, imgW - originX);
    height = clamp(height, 1, imgH - originY);

    const cropRect = { originX, originY, width, height };

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropRect }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    onCapture({
      photo: manipResult,
      photoPath: manipResult.uri,
    });
  } catch (e) {
    console.warn('takePhoto or crop failed:', e);
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

      {/* 白色取景框 */}
      <View style={styles.viewfinder} />

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

  viewfinder: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '40%',
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
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
