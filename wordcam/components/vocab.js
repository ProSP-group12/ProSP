export async function getVocabularyFromAPI(imageBase64) {
  try {
    const res = await fetch('http://10.127.16.14:4000/detect-good', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('API error:', data);
      return [];
    }

    // Expect API to return vocab array
    return data.vocab || [];
  } catch (err) {
    console.error('Network error:', err);
    return [];
  }
}
