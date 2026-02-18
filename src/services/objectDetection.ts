// Service helpers for object detection

export interface DetectedObject {
  label: string;
  confidence: number; // 0..1

  // ✅ Google Vision label detection 不一定有框，所以设为可选
  bounds?: { x: number; y: number; width: number; height: number };

  finnish?: string;
  chinese?: string;
}


// Map ML Kit object results to our DetectedObject shape
export function mapMLKitObjects(mlkitObjects: any[]): DetectedObject[] {
  return (mlkitObjects || []).map((o) => {
    const labels = Array.isArray(o.labels) ? o.labels : [];
    const firstLabel = labels[0];

    const rect = o.boundingBox || o.frame || {};
    const x = rect.origin?.x ?? rect.x ?? rect.left ?? 0;
    const y = rect.origin?.y ?? rect.y ?? rect.top ?? 0;
    const width = rect.size?.width ?? rect.width ?? (rect.right != null && rect.left != null ? rect.right - rect.left : 0);
    const height = rect.size?.height ?? rect.height ?? (rect.bottom != null && rect.top != null ? rect.bottom - rect.top : 0);

    return {
      // ✅ 没 label 时不要叫 Unknown，叫 "object" 更符合实际
      label: firstLabel?.text ?? firstLabel?.label ?? o.trackingId?.toString?.() ?? 'object',
      confidence: typeof firstLabel?.confidence === 'number' ? firstLabel.confidence : 0,
      bounds: { x, y, width, height },
    };
  });
}


// simple translation table for demo purposes
const TRANSLATIONS: Record<string, { finnish: string; chinese: string }> = {
  dog: { finnish: 'koira', chinese: '狗' },
  cat: { finnish: 'kissa', chinese: '猫' },
  person: { finnish: 'henkilö', chinese: '人' },
  object: { finnish: 'esine', chinese: '物体' },
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