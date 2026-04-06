import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getPublishedInsights, Insight } from '../lib/insights';
import { ArrowRight, Calendar, User } from 'lucide-react';

export function InsightsList({ onSelectInsight }: { onSelectInsight: (insight: Insight) => void }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await getPublishedInsights();
        setInsights(data);
      } catch (error) {
        console.error("Failed to load insights:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="py-20 lg:py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          IT <span className="text-orange-500">Insights</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Expert advice, security alerts, and technology strategies for Atlanta businesses.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No insights published yet. Check back soon!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-colors group cursor-pointer flex flex-col"
              onClick={() => onSelectInsight(insight)}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={insight.featuredImage} 
                  alt={insight.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(insight.publishedAt), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {insight.author}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-orange-400 transition-colors line-clamp-2">
                  {insight.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                  {insight.content.replace(/[#*]/g, '').split('\n')[0]}
                </p>
                <div className="flex items-center text-orange-500 text-sm font-medium gap-2 mt-auto">
                  Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
