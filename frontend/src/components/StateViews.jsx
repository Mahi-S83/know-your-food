// src/components/StateViews.jsx
import React from 'react';
import { Camera, AlertCircle, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';

// --- 1. EMPTY STATE (Welcome Screen) ---
export const EmptyState = ({ onUpload }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 text-center animate-fade-in-up">
      
      {/* Animated Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20 duration-1000"></div>
          <div className="bg-emerald-50 p-6 rounded-full relative z-10 ring-1 ring-emerald-100">
            <Camera className="text-emerald-600 w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-800 mb-3">
        Scan Your First Product
      </h2>
      <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
        Reveal hidden additives and health scores instantly.
      </p>

      {/* Upload Button */}
      <label className="w-full block cursor-pointer bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300">
        Tap to Open Camera
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={onUpload} 
        />
      </label>
    </div>
  );
};

// --- 2. ERROR STATE (Friendly Failure) ---
export const ErrorState = ({ errorType, onRetry }) => {
  
  // Choose text based on what went wrong
  const getContent = () => {
    switch(errorType) {
      case 'NO_INGREDIENTS':
        return {
          title: "No Ingredients Found",
          msg: "We couldn't spot an ingredients list. Make sure you're not scanning the front label!",
          icon: <ImageIcon className="text-amber-500 w-10 h-10" />,
          color: "bg-amber-500 hover:bg-amber-600"
        };
      case 'API_ERROR':
        return {
          title: "Brain Freeze 🤖",
          msg: "The AI service is temporarily down. Please try again in a moment.",
          icon: <RefreshCw className="text-slate-500 w-10 h-10" />,
          color: "bg-slate-800 hover:bg-slate-900"
        };
      default:
        return {
          title: "Couldn't Read That",
          msg: "The photo might be blurry. Try getting closer to the text.",
          icon: <AlertCircle className="text-rose-500 w-10 h-10" />,
          color: "bg-rose-500 hover:bg-rose-600"
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center animate-shake">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-50 p-4 rounded-full">
          {content.icon}
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-800 mb-2">{content.title}</h2>
      <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
        {content.msg}
      </p>

      <button
        onClick={onRetry}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${content.color}`}
      >
        <RefreshCw size={20} />
        Try Again
      </button>
    </div>
  );
};