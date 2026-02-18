import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DetectedObject } from '../services/objectDetection';

interface Props {
  objects: DetectedObject[];
  frameWidth?: number;
  frameHeight?: number;
  viewWidth?: number;
  viewHeight?: number;
}

const BoundingBoxOverlay: React.FC<Props> = ({
  objects,
  frameWidth = 1,
  frameHeight = 1,
  viewWidth = 1,
  viewHeight = 1,
}) => {
  const scaleX = viewWidth / frameWidth;
  const scaleY = viewHeight / frameHeight;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {objects.map((obj, idx) => {
        const { x, y, width, height } = obj.bounds;
        return (
          <View
            key={idx}
            style={[
              styles.box,
              {
                left: x * scaleX,
                top: y * scaleY,
                width: width * scaleX,
                height: height * scaleY,
              },
            ]}
          >
            <Text style={styles.label} numberOfLines={1}>
              {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderColor: '#00FF00',
    borderWidth: 2,
    backgroundColor: 'rgba(0,255,0,0.1)',
  },
  label: {
    color: '#00FF00',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
  },
});

export default BoundingBoxOverlay;