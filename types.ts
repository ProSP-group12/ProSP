export interface SentenceCapResponse {
  detected_text: string;     // The text found in the image or a description of the scene
  translated_text: string;   // The translation of the text
  source_language: string;   // e.g., 'English'
  target_language: string;   // e.g., 'Chinese'
  keywords: string[];        // Key concepts or tags from the content
  sentiment: string;         // Brief tone analysis (e.g., "Neutral", "Informative")
}

export enum AnalysisMode {
  IMAGE = 'IMAGE',
  CAMERA = 'CAMERA'
}