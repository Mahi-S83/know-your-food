import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, RefreshCw, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- IMPORTS ---
// Make sure these paths match where your files actually are!
import ScoreDisplay from './ScoreDisplay'; 
import IngredientList from './IngredientList';
import { EmptyState, ErrorState } from '../components/StateViews'; 

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE MACHINE ---
  // Status: 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR'
  const [appState, setAppState] = useState('IDLE'); 
  const [errorType, setErrorType] = useState(null);
  
  // Data States
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [healthStatus, setHealthStatus] = useState('neutral');

  // 1. Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  // 2. Smart File Handler
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation
      if (file.size > 5 * 1024 * 1024) { 
        setErrorType('UPLOAD_FAILED'); // Use errorType, not setError
        setAppState('ERROR');
        return;
      }
      
      // Success
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAppState('IDLE'); // Stay in IDLE, but now we have an imagePreview
    }
  };

  // 3. Analysis Function
  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setAppState('ANALYZING'); // Show Loading Skeleton
    
    const formData = new FormData();
    formData.append('file', imageFile);
    const token = localStorage.getItem('token');

    const API_URL = import.meta.env.DEV 
      ? 'http://127.0.0.1:8000' 
      : 'https://know-your-food-4toj.onrender.com';

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('API_FAIL');

      const data = await response.json();
      
      // JSON Parsing
      let aiResponse;
      try {
        const cleanJson = data.message.replace(/```json/g, '').replace(/```/g, '');
        aiResponse = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        aiResponse = { summary: "Could not parse AI results.", ingredients: [], score: 0 };
      }

      // Check for empty ingredients
      if (!aiResponse.ingredients || aiResponse.ingredients.length === 0) {
        setErrorType('NO_INGREDIENTS');
        setAppState('ERROR');
        return;
      }

      setResult(aiResponse);
      setHealthStatus(determineHealthStatus(aiResponse.score)); 
      setAppState('SUCCESS');
      
    } catch (err) {
      console.error(err);
      setErrorType('API_ERROR');
      setAppState('ERROR');
    }
  };

  // 4. Helpers
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KnowYourFood Analysis',
          text: `I just scanned a product and it scored ${result.score}/100!`,
          url: window.location.href,
        });
      } catch (err) { console.log('Error sharing:', err); }
    } else {
      alert(`Product Score: ${result?.score}/100.`);
    }
  };

  const getStatusStyles = () => {
    switch(healthStatus) {
      case 'good': return 'bg-emerald-50 border-emerald-200 shadow-emerald-100';
      case 'warning': return 'bg-amber-50 border-amber-200 shadow-amber-100';
      case 'bad': return 'bg-rose-50 border-rose-200 shadow-rose-100';
      default: return 'bg-white border-slate-100 shadow-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8 md:max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            knowYour<span className="text-emerald-600">Food</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Instant ingredient analysis powered by AI
          </p>
        </div>

        <div className="grid gap-6">
          
          {/* --- VIEW 1: IDLE --- */}
          {appState === 'IDLE' && (
            // Logic: If no image, show Empty State. If image exists, show Preview.
            !imagePreview ? (
              <EmptyState onUpload={handleUpload} />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 overflow-hidden animate-fade-in">
                <div className="relative flex flex-col items-center justify-center bg-slate-900 rounded-2xl border-2 border-transparent">
                   <img src={imagePreview} className="w-full h-64 object-cover opacity-80 rounded-2xl" alt="Preview" />
                   
                   {/* Overlay Controls */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-6">
                     <div className="flex gap-3">
                       <button 
                         onClick={handleAnalyze}
                         className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform flex justify-center items-center gap-2"
                       >
                         REVEAL TRUTH
                         <ShieldCheck size={20} />
                       </button>
                       <button 
                         onClick={resetScanner}
                         className="bg-white/10 text-white p-4 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors"
                       >
                         <RefreshCw size={24} />
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            )
          )}

          {/* --- VIEW 2: LOADING --- */}
          {appState === 'ANALYZING' && (
             <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-lg animate-pulse">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                  <div className="h-6 w-48 bg-slate-200 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
                </div>
             </div>
          )}

          {/* --- VIEW 3: ERROR --- */}
          {appState === 'ERROR' && (
            <ErrorState errorType={errorType} onRetry={resetScanner} />
          )}

          {/* --- VIEW 4: SUCCESS --- */}
          {appState === 'SUCCESS' && result && (
            <div className={`border rounded-3xl p-8 shadow-xl transition-all duration-500 animate-slide-up ${getStatusStyles()}`}>
              
              <div className="flex justify-center mb-8">
                <ScoreDisplay 
                  score={result.score || 0} 
                  rating={healthStatus === 'good' ? 'Healthy' : healthStatus === 'warning' ? 'Moderate' : 'Unhealthy'} 
                />
              </div>

              <div className="mb-8 text-center px-4">
                <p className="text-slate-600 font-medium text-lg italic leading-relaxed">
                  "{result.summary}"
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ShieldCheck size={24} className="text-slate-400"/>
                  Detailed Breakdown
                </h3>
                <IngredientList ingredients={result.ingredients} />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetScanner}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 flex justify-center items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Scan Next Item
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-white text-slate-600 border-2 border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 flex justify-center items-center gap-2"
                >
                  <Share2 size={20} />
                  Share Result
                </button>
              </div>

            </div>
          )}
        </div>

        {/* FAB */}
        {appState === 'SUCCESS' && (
          <button
            onClick={resetScanner}
            className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 active:scale-90 transition-all z-50 animate-bounce-in"
          >
            <Camera size={28} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;