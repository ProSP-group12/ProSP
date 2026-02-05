import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

// detectGood: calls a remote API when configured, otherwise uses local analysis.
export async function detectGood(imageUri) {
  // Look for a configured URL in app config: expo.extra.DETECT_API_URL
  const url =
    Constants?.manifest?.extra?.DETECT_API_URL ||
    Constants?.expoConfig?.extra?.DETECT_API_URL ||
    null;

  // If no remote URL is configured, use local image analysis.
  if (!url) {
    console.log('[detectGood] no DETECT_API_URL configured; using local analysis');
    const good = await analyzeImageLocally(imageUri);
    return { good, vocab: good ? [{ word: 'example' }] : [] };
  }

  try {
    if (!imageUri) {
      console.warn('[detectGood] called without imageUri');
      return false;
    }

    console.log('[detectGood] sending image to', url);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // ✅ FIX: match backend expected key
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[detectGood] server error', resp.status, text);
      return { good: false, vocab: [] };
    }

    const json = await resp.json();
    console.log('[detectGood] response', JSON.stringify(json));

    // Expect { good: true, vocab: [...] }
    return {
      good: !!json?.good,
      vocab: Array.isArray(json?.vocab) ? json.vocab : [],
    };

  } catch (e) {
    console.error('[detectGood] failed', e?.message || e);
    return { good: false, vocab: [] };
  }
}

// Local image quality analysis (free, no API calls)
async function analyzeImageLocally(imageUri) {
  try {
    // Get image dimensions
    const { width, height } = await new Promise((resolve, reject) => {
      Image.getSize(imageUri, (w, h) => resolve({ width: w, height: h }), reject);
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const fileSizeKB = fileInfo.size / 1024;

    console.log(`[detectGood] local analysis - size: ${width}x${height}, file: ${fileSizeKB.toFixed(1)}KB`);

    let score = 0;

    // Size check (reasonable resolution)
    if (width >= 800 && height >= 600) score += 1;

    // File size check (not too small)
    if (fileSizeKB > 50) score += 1;

    // Aspect ratio check
    const aspectRatio = Math.max(width / height, height / width);
    if (aspectRatio < 3) score += 1;

    // Consider good if at least 2 / 3 criteria met
    const good = score >= 2;
    console.log(`[detectGood] local analysis -> ${good} (score: ${score}/3)`);
    return good;

  } catch (e) {
    console.error('[detectGood] local analysis failed', e?.message || e);

    // Fallback random
    const fallback = Math.random() < 0.7;
    console.log(`[detectGood] fallback simulation -> ${fallback}`);
    return fallback;
  }
}

export default { detectGood };
