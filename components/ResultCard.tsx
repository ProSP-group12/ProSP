import React from 'react';
import { SentenceCapResponse } from '../types';
import { Languages, MessageSquare, Tag, BookOpen, Volume2 } from 'lucide-react';

interface ResultCardProps {
  data: SentenceCapResponse;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up space-y-6 pb-12">
      
      {/* Meta Header */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Languages className="w-3 h-3" /> {data.source_language} → {data.target_language}
        </span>
        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-600">
            {data.sentiment} Tone
        </span>
      </div>

      {/* Main Translation Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
        {/* Detected Text */}
        <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Detected Content
            </h3>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-serif">
                "{data.detected_text}"
            </p>
        </div>

        {/* Translation */}
        <div className="p-6 bg-blue-900/10">
            <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                <Languages className="w-4 h-4" /> Translation
            </h3>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                {data.translated_text}
            </p>
        </div>
      </div>

      {/* Word Cards / Stickers Section */}
      {data.vocabulary_cards && data.vocabulary_cards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Word Cards
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.vocabulary_cards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-[#fff9f0] text-slate-800 p-5 rounded-xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200 group relative"
              >
                {/* Sticker Hole Punch (Visual effect) */}
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-900/10"></div>

                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold text-slate-900">{card.word}</h4>
                  <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    {card.part_of_speech}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm font-mono mb-3">
                  <Volume2 className="w-3 h-3" />
                  <span>[{card.phonetic}]</span>
                </div>

                <p className="text-sm text-slate-700 italic mb-4 border-l-2 border-blue-400 pl-2">
                  {card.definition}
                </p>

                <div className="bg-white/50 rounded-lg p-2 text-xs space-y-1">
                  <p className="text-slate-800 font-medium">"{card.example_original}"</p>
                  <p className="text-slate-500">{card.example_translated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords / Tags */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
        {data.keywords.map((tag, idx) => (
            <span key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-400 border border-slate-700">
                <Tag className="w-3 h-3" /> {tag}
            </span>
        ))}
      </div>

    </div>
  );
};

export default ResultCard;