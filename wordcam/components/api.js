import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

// detectGood: calls a remote API when configured, otherwise simulates.
export async function detectGood(imageUri) {
  // Look for a configured URL in app config: expo.extra.DETECT_API_URL
  const url =
    Constants?.manifest?.extra?.DETECT_API_URL ||
    Constants?.expoConfig?.extra?.DETECT_API_URL ||
    null;
  // If no remote URL is configured, fall back to heuristic simulation.
  if (!url) {
    console.log('[detectGood] no DETECT_API_URL configured; using local heuristic');
    const simulated = Math.random() < 0.85;
    console.log(`[detectGood] simulated -> ${simulated}`);
    return simulated;
  }

  try {
    if (!imageUri) {
      console.warn('[detectGood] called without imageUri');
      return false;
    }

    console.log('[detectGood] sending image to', url);
    // Read file as base64 and POST to the detection API.
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[detectGood] server error', resp.status, text);
      return false;
    }

    const json = await resp.json();
    console.log('[detectGood] response', JSON.stringify(json));
    // Expect the API to return { good: true } on success.
    return !!json?.good;
  } catch (e) {
    console.error('[detectGood] failed', e?.message || e);
    // On any failure, treat as not good to be conservative.
    return false;
  }
}

export default { detectGood };
