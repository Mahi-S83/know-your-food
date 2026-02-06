import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, RefreshCw, Share2, History, AlertTriangle, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- INTERNAL COMPONENTS (Moved inside to prevent crashes) ---

const EmptyState = ({ onUpload }) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 md:p-12 text-center hover:border-emerald-400 hover:bg-slate-50 transition-all cursor-pointer group">
    <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
      <Camera className="text-emerald-600 w-10 h-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">Scan Ingredients</h3>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
      Take a photo of the ingredient label to instantly analyze health risks.
    </p>
    
    <input 
      type="file" 
      id="file-upload" 
      className="hidden" 
      accept="image/*" 
      onChange={onUpload}
    />
    <label 
      htmlFor="file-upload" 
      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
    >
      <UploadCloud size={20} />
      Upload Label
    </label>
  </div>
);

const ScoreDisplay = ({ score, rating }) => {
  let color = 'text-emerald-500';
  if (score < 50) color = 'text-rose-500';
  else if (score < 80) color = 'text-amber-500';

  return (
    <div className="text-center">
      <div className={`text-6xl font-black ${color} mb-2`}>{score}</div>
      <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">{rating}</div>
    </div>
  );
};

// --- MAIN HOME COMPONENT ---

const Home = () => {
  const navigate = useNavigate();
  
  // State Machine
  const [appState, setAppState] = useState('IDLE'); 
  const [errorType, setErrorType] = useState(null);
  
  // Data
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [healthStatus, setHealthStatus] = useState('neutral');

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  // Handle File
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setErrorType('File too large (Max 5MB)');
        setAppState('ERROR');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAppState('IDLE');
    }
  };

  // Analysis Logic
  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setAppState('ANALYZING');
    
    const formData = new FormData();
    formData.append('file', imageFile);
    const token = localStorage.getItem('token');

    // smart switch between local and production URLs
    const API_URL = import.meta.env.DEV 
      ? 'http://127.0.0.1:8000' 
      : 'https://know-your-food-4toj.onrender.com'; // Your Render URL

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('API_FAIL');

      const data = await response.json();
      
      // Smart JSON Parsing
      let aiResponse;
      try {
        const cleanJson = data.message.replace(/```json/g, '').replace(/```/g, '');
        aiResponse = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback if AI sends plain text instead of JSON
        aiResponse = { 
            summary: data.message, 
            ingredients: [], 
            score: 75 // Default score if parsing fails
        };
      }

      setResult(aiResponse);
      setHealthStatus(determineHealthStatus(aiResponse.score || 0)); 
      setAppState('SUCCESS');
      
    } catch (err) {
      console.error(err);
      setErrorType('Server Error. Ensure Backend is running.');
      setAppState('ERROR');
    }
  };

  const determineHealthStatus = (score) => {
    if (score >= 80) return 'good';
    if (score <= 49) return 'bad';
    return 'warning';
  };

  const resetScanner = () => {
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
    setAppState('IDLE'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8 md:max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              knowYour<span className="text-emerald-600">Food</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">
              AI Ingredient Analysis
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/history')}
            className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-colors"
          >
            <History size={20} />
          </button>
        </div>

        <div className="grid gap-6">
          
          {/* STATE: IDLE (Upload or Preview) */}
          {appState === 'IDLE' && (
            !imagePreview ? (
              <EmptyState onUpload={handleUpload} />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl overflow-hidden">
                <div className="relative flex flex-col items-center justify-center bg-slate-900 rounded-2xl">
                   <img src={imagePreview} className="w-full h-64 object-cover opacity-80 rounded-2xl" alt="Preview" />
                   
                   <div className="absolute inset-0 flex flex-col justify-end p-6">
                     <div className="flex gap-3">
                       <button 
                         onClick={handleAnalyze}
                         className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
                       >
                         REVEAL TRUTH <ShieldCheck size={20} />
                       </button>
                       <button 
                         onClick={resetScanner}
                         className="bg-white/20 text-white p-4 rounded-xl backdrop-blur-sm hover:bg-white/30"
                       >
                         <RefreshCw size={24} />
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            )
          )}

          {/* STATE: ANALYZING */}
          {appState === 'ANALYZING' && (
             <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-lg text-center py-16">
                <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Analyzing Ingredients...</h3>
                <p className="text-slate-400">Consulting AI Knowledge Base</p>
             </div>
          )}

          {/* STATE: ERROR */}
          {appState === 'ERROR' && (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-rose-700 mb-2">Analysis Failed</h3>
              <p className="text-rose-600 mb-6">{errorType || "Something went wrong"}</p>
              <button onClick={resetScanner} className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold">
                Try Again
              </button>
            </div>
          )}

          {/* STATE: SUCCESS */}
          {appState === 'SUCCESS' && result && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
              
              <ScoreDisplay 
                score={result.score || 0} 
                rating={healthStatus === 'good' ? 'Healthy' : healthStatus === 'warning' ? 'Moderate' : 'Unhealthy'} 
              />

              <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-600 italic text-center">"{result.summary}"</p>
              </div>

              {/* Simple Ingredient List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={18} /> Ingredients
                </h4>
                {result.ingredients && result.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="font-medium text-slate-700">{ing.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                            ${ing.rating === 'Red' ? 'bg-rose-100 text-rose-700' : 
                              ing.rating === 'Green' ? 'bg-emerald-100 text-emerald-700' : 
                              'bg-amber-100 text-amber-700'}`}>
                            {ing.rating}
                        </span>
                    </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={resetScanner} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold">
                  Scan Next
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;