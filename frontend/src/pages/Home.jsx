import React, { useState, useEffect } from 'react'; // <--- FIX 1: Added useEffect here
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Home = () => {
  const navigate = useNavigate();

  // 1. Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to Login if no token found
    }
  }, [navigate]);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // --- FIX 2: Updated analyze function to send Token ---
  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', imageFile); // Ensure your backend expects 'file' (not 'image')

    // Get the token from storage
    const token = localStorage.getItem('token');

    try {
      // CORRECT URL (Must include /analyze)
    const response = await fetch('https://know-your-food-4toj.onrender.com/analyze', { 
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`, 
  },
  body: formData, 
});

      if (!response.ok) {
        throw new Error('Analysis failed or unauthorized');
      }

      const data = await response.json();
      setResult(data.message); // Save the answer
      
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
          knowYour<span className="text-emerald-600">Food</span>
        </h1>
        <p className="text-slate-500 font-medium">Reveal the truth behind every label.</p>
      </div>

      <div className="grid gap-8">
        {/* Card 1: The Scanner */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-8 px-4 bg-slate-50 hover:bg-emerald-50/50 transition-colors">
            {!imagePreview ? (
              <>
                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                  <Camera className="text-emerald-600" size={32} />
                </div>
                <label className="cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                  Scan Ingredient List
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </>
            ) : (
              <div className="w-full text-center">
                <img src={imagePreview} className="rounded-xl w-full max-h-64 object-cover mb-6 border-4 border-white shadow-sm" alt="Preview" />
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "ANALYZE NOW"}
                </button>
                <button onClick={() => {setImagePreview(null); setImageFile(null); setResult(null);}} className="mt-4 text-slate-400 font-bold text-sm">
                  Cancel / Retake
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: The Results */}
        {result && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <ShieldCheck className="text-emerald-500" size={28} />
              <h2 className="text-2xl font-black text-slate-800">Analysis Report</h2>
            </div>
            
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-emerald-700 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;