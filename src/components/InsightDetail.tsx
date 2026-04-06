import React from 'react';
import { format, parseISO } from 'date-fns';
import { Insight } from '../lib/insights';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export function InsightDetail({ insight, onBack }: { insight: Insight, onBack: () => void }) {
  return (
    <div className="py-12 lg:py-20 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Insights
      </button>

      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
          {insight.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-slate-300">{insight.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>{format(parseISO(insight.publishedAt), 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden mb-12 border border-slate-800">
        <img 
          src={insight.featuredImage} 
          alt={insight.title} 
          className="w-full h-auto max-h-[500px] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="prose prose-invert prose-orange max-w-none">
        {insight.content.split('\n').map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return <h3 key={idx} className="text-2xl font-bold mt-8 mb-4 text-white">{paragraph.replace('### ', '')}</h3>;
          }
          if (paragraph.startsWith('* ')) {
            return <li key={idx} className="ml-4 mb-2 text-slate-300">{paragraph.replace('* ', '')}</li>;
          }
          if (paragraph.trim() === '') {
            return <br key={idx} />;
          }
          return <p key={idx} className="text-slate-300 leading-relaxed mb-4">{paragraph}</p>;
        })}
      </div>
    </div>
  );
}
