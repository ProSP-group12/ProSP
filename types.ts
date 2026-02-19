export interface VocabularyCard {
  word: string;
  part_of_speech: string;    // e.g., "noun", "verb"
  phonetic: string;          // e.g., "/ˈæp.əl/" or pinyin
  definition: string;        // Brief definition
  example_original: string;  // Example sentence in source language
  example_translated: string;// Example sentence translated
}

export interface SentenceCapResponse {
  detected_text: string;     // The text found in the image or a description of the scene
  translated_text: string;   // The translation of the text
  source_language: string;   // e.g., 'English'
  target_language: string;   // e.g., 'Chinese'
  keywords: string[];        // Key concepts or tags from the content
  sentiment: string;         // Brief tone analysis (e.g., "Neutral", "Informative")
  vocabulary_cards: VocabularyCard[]; // Generated word stickers
}

export enum AnalysisMode {
  IMAGE = 'IMAGE',
  CAMERA = 'CAMERA'
}