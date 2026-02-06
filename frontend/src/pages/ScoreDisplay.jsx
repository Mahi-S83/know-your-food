import React, { useState, useEffect } from 'react';

const ScoreDisplay = ({ score, rating }) => {
  // State to handle the "Count Up" number animation
  const [displayScore, setDisplayScore] = useState(0);

  // 1. ANIMATION LOGIC
  // This effect handles counting the number up from 0 to the target score over 1 second
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1000; // 1 second animation

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smooth deceleration (easeOutQuad)
      // makes the numbers update fast at first, then slow down
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      
      setDisplayScore(Math.floor(easeProgress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  // 2. COLOR LOGIC
  // Returns Tailwind classes based on the score range
  const getColorScheme = (value) => {
    if (value < 50) {
      return {
        text: 'text-red-500',
        stroke: 'stroke-red-500',
        bg: 'bg-red-50 text-red-700',
        shadow: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' // Red glow
      };
    } else if (value < 80) {
      return {
        text: 'text-amber-500', // Matches #F59E0B
        stroke: 'stroke-amber-500',
        bg: 'bg-amber-50 text-amber-700',
        shadow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' // Amber glow
      };
    } else {
      return {
        text: 'text-emerald-500', // Matches #10B981
        stroke: 'stroke-emerald-500',
        bg: 'bg-emerald-50 text-emerald-700',
        shadow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' // Green glow
      };
    }
  };

  const colors = getColorScheme(score);

  // 3. SVG MATH
  // We use a radius of 58 to fit inside a 128x128 viewbox with stroke width
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate how much of the circle should be "filled"
  // We use displayScore for the animation so the bar fills up with the number
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-fade-in-up">
      
      {/* Container for the Circle */}
      <div className="relative w-48 h-48 mb-4">
        
        {/* SVG Circle */}
        <svg 
          className="w-full h-full transform -rotate-90" 
          viewBox="0 0 128 128"
        >
          {/* Background Track (Gray Circle) */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          
          {/* Foreground Progress (Colored Circle) */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colors.stroke} ${colors.shadow} transition-all duration-300 ease-out`}
          />
        </svg>

        {/* Centered Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[64px] font-black leading-none ${colors.text} transition-colors duration-300`}>
            {displayScore}
          </span>
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mt-1">
            Score
          </span>
        </div>
      </div>

      {/* Rating Badge */}
      <div className={`px-6 py-2 rounded-full font-bold text-lg transition-colors duration-300 ${colors.bg}`}>
        {rating}
      </div>

    </div>
  );
};

export default ScoreDisplay;