import React from 'react';
import { SentenceCapResponse } from '../types';
import { Languages, MessageSquare, Tag } from 'lucide-react';

interface ResultCardProps {
  data: SentenceCapResponse;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up space-y-4">
      
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

      {/* Keywords / Tags */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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