// Service helpers for object detection

export interface DetectedObject {
  label: string;
  confidence: number; // 0..1
  bounds: { x: number; y: number; width: number; height: number };
}

// Map ML Kit object results to our DetectedObject shape
export function mapMLKitObjects(mlkitObjects: any[]): DetectedObject[] {
  return mlkitObjects.map((o) => {
    const firstLabel = (o.labels && o.labels[0]) || {};
    const rect = o.boundingBox || {};
    return {
      label: firstLabel.text || 'Unknown',
      confidence: firstLabel.confidence || 0,
      bounds: {
        x: rect.origin?.x || 0,
        y: rect.origin?.y || 0,
        width: rect.size?.width || rect.width || 0,
        height: rect.size?.height || rect.height || 0,
      },
    };
  });
}

// simple translation table for demo purposes
const TRANSLATIONS: Record<string, { finnish: string; chinese: string }> = {
  dog: { finnish: 'koira', chinese: '狗' },
  cat: { finnish: 'kissa', chinese: '猫' },
  person: { finnish: 'henkilö', chinese: '人' },
};

export function translateLabel(label: string) {
  const key = label.toLowerCase();
  const entry = TRANSLATIONS[key] || { finnish: '', chinese: '' };
  return {
    english: label,
    finnish: entry.finnish,
    chinese: entry.chinese,
  };
}