import * as FileSystem from 'expo-file-system/legacy';
import { API_CONFIG } from '../constants/config';

const normalizeConfidence01 = (c) => {
  const n = typeof c === 'number' ? c : Number(c);
  if (!isFinite(n)) return 0;

  if (n <= 1) return Math.max(0, n);
  if (n <= 100) return Math.max(0, n / 100);
  if (n <= 10000) return Math.max(0, n / 10000);

  return 1;
};

export const sendToImageRecognitionAPI = async (imageData) => {
  if (!imageData?.uri) {
    throw new Error('Invalid image URI');
  }

  try {
    const base64Data = await FileSystem.readAsStringAsync(imageData.uri, {
      encoding: 'base64',
    });

    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('base64', base64Data);

    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${text}`);
    }

    const result = await response.json();

    if (!Array.isArray(result.objects)) {
      return [];
    }

    return result.objects.map((obj) => {
      const labelRaw = obj?.label ?? obj?.name ?? '';
      const label = String(labelRaw).trim();

      return {
        label: label.length > 0 ? label : 'object',
        finnish: (obj?.finnish ?? '').toString(),
        chinese: (obj?.chinese ?? '').toString(),
        confidence: normalizeConfidence01(obj?.confidence),
      };
    });
  } catch (err) {
    console.error('Image recognition error:', err);
    throw new Error(err?.message || 'Failed to recognize image');
  }
};
