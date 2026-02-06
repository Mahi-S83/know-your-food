import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Award, ChevronRight } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      // Adjust URL if needed for production
      const API_URL = import.meta.env.DEV 
        ? 'http://127.0.0.1:8000' 
        : 'https://know-your-food-4toj.onrender.com';
        
      try {
        const response = await fetch(`${API_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setScans(data);
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Helper for Score Colors
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score <= 49) return 'text-rose-600 bg-rose-50 border-rose-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Your Food Diary</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
           <div className="text-center py-12 text-slate-400">Loading diary...</div>
        ) : scans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-medium">No scans yet</h3>
            <p className="text-slate-500 text-sm mt-1">Scan a product to start building your history.</p>
          </div>
        ) : (
          scans.map((scan) => (
            <div 
              key={scan.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              {/* Score Badge */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border
                ${getScoreColor(scan.score)}
              `}>
                {scan.score}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800 truncate pr-2">
                    {/* Fallback if filename is ugly */}
                    {scan.filename.length > 20 ? 'Scanned Product' : scan.filename}
                  </h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {scan.summary}
                </p>
              </div>

              <ChevronRight className="text-slate-300 w-5 h-5 flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;