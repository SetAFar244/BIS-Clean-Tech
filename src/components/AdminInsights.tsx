import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getAllInsights, createInsight, updateInsight, deleteInsight, Insight, seedInitialInsights } from '../lib/insights';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, Eye } from 'lucide-react';

export function AdminInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInsight, setEditingInsight] = useState<Partial<Insight> | null>(null);
  const [insightToDelete, setInsightToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      await seedInitialInsights(); // Ensure initial data exists
      const data = await getAllInsights();
      setInsights(data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingInsight?.title || !editingInsight?.content) return;

    try {
      const insightData = {
        title: editingInsight.title,
        content: editingInsight.content,
        author: editingInsight.author || 'Tony Brown',
        featuredImage: editingInsight.featuredImage || `https://picsum.photos/seed/${Math.random()}/800/400`,
        publishedAt: editingInsight.publishedAt || new Date().toISOString(),
        status: editingInsight.status || 'draft'
      } as Insight;

      if (editingInsight.id) {
        await updateInsight(editingInsight.id, insightData);
      } else {
        await createInsight(insightData);
      }
      
      setEditingInsight(null);
      loadInsights();
    } catch (error) {
      console.error("Failed to save insight:", error);
    }
  };

  const confirmDelete = async () => {
    if (!insightToDelete) return;
    try {
      await deleteInsight(insightToDelete);
      setInsightToDelete(null);
      loadInsights();
    } catch (error) {
      console.error("Failed to delete insight:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (editingInsight) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{editingInsight.id ? 'Edit Insight' : 'New Insight'}</h3>
          <button onClick={() => setEditingInsight(null)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              value={editingInsight.title || ''} 
              onChange={e => setEditingInsight({...editingInsight, title: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              placeholder="Article title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Author</label>
              <input 
                type="text" 
                value={editingInsight.author || 'Tony Brown'} 
                onChange={e => setEditingInsight({...editingInsight, author: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select 
                value={editingInsight.status || 'draft'} 
                onChange={e => setEditingInsight({...editingInsight, status: e.target.value as 'draft' | 'published'})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Featured Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={editingInsight.featuredImage || ''} 
                onChange={e => setEditingInsight({...editingInsight, featuredImage: e.target.value})}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                placeholder="https://..."
              />
              <button 
                onClick={() => setEditingInsight({...editingInsight, featuredImage: `https://picsum.photos/seed/${Math.random()}/800/400`})}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Random
              </button>
            </div>
            {editingInsight.featuredImage && (
              <img src={editingInsight.featuredImage} alt="Preview" className="mt-2 h-32 rounded-lg object-cover border border-slate-800" referrerPolicy="no-referrer" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Content (Markdown supported)</label>
            <textarea 
              value={editingInsight.content || ''} 
              onChange={e => setEditingInsight({...editingInsight, content: e.target.value})}
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-sm"
              placeholder="Write your article content here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              onClick={() => setEditingInsight(null)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Save className="w-4 h-4" /> Save Insight
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Insights</h3>
        <button 
          onClick={() => setEditingInsight({ status: 'draft', author: 'Tony Brown' })}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Insight
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400">No insights found. Create your first post!</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {insights.map(insight => (
                  <tr key={insight.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {insight.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        insight.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {insight.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {format(parseISO(insight.publishedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingInsight(insight)}
                          className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => insight.id && setInsightToDelete(insight.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {insightToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-white">Delete Insight?</h3>
            <p className="text-slate-400 mb-6">Are you sure you want to delete this insight? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setInsightToDelete(null)} 
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
