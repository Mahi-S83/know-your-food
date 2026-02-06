import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const IngredientList = ({ ingredients = [] }) => {
  
  // 1. Safety Check: If no ingredients, show nothing
  if (!ingredients || ingredients.length === 0) return null;

  // 2. Grouping Logic: Separate the ingredients into buckets
  const grouped = {
    Red: ingredients.filter(i => i.rating === 'Red'),
    Yellow: ingredients.filter(i => i.rating === 'Yellow'),
    Green: ingredients.filter(i => i.rating === 'Green'),
  };

  // 3. Configuration Object (The "Theme" for each section)
  const SECTION_CONFIG = {
    Red: {
      title: "Harmful / Avoid",
      icon: <AlertCircle className="w-5 h-5" />,
      headerStyle: "bg-red-100 text-red-900 border-red-200",
      cardStyle: "bg-red-50 border-red-500",
      textStyle: "text-red-900",
      subTextStyle: "text-red-700/80"
    },
    Yellow: {
      title: "Moderate / Processed",
      icon: <AlertTriangle className="w-5 h-5" />,
      headerStyle: "bg-amber-100 text-amber-900 border-amber-200",
      cardStyle: "bg-amber-50 border-amber-500",
      textStyle: "text-amber-900",
      subTextStyle: "text-amber-700/80"
    },
    Green: {
      title: "Safe / Natural",
      icon: <CheckCircle className="w-5 h-5" />,
      headerStyle: "bg-emerald-100 text-emerald-900 border-emerald-200",
      cardStyle: "bg-emerald-50 border-emerald-500",
      textStyle: "text-emerald-900",
      subTextStyle: "text-emerald-700/80"
    }
  };

  // 4. Sub-Component for each Section
  const Section = ({ type, items }) => {
    const [isOpen, setIsOpen] = useState(true); // Collapsible state
    if (items.length === 0) return null; // Don't render empty sections

    const config = SECTION_CONFIG[type];

    return (
      <div className="mb-6 last:mb-0 animate-fade-in-up">
        {/* Header Bar */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between 
            px-4 py-3 rounded-xl border mb-3 
            transition-all duration-200
            ${config.headerStyle}
          `}
        >
          <div className="flex items-center gap-2 font-bold">
            {config.icon}
            <span>{config.title}</span>
            <span className="ml-2 bg-white/40 px-2 py-0.5 rounded-full text-xs">
              {items.length}
            </span>
          </div>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* List of Ingredient Cards */}
        {isOpen && (
          <div className="space-y-3 pl-1">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className={`
                  p-4 rounded-r-xl border-l-4 shadow-sm 
                  transition-transform hover:translate-x-1 duration-200
                  ${config.cardStyle}
                `}
              >
               <div className="font-bold text-lg leading-tight mb-1 break-words">  {/* <--- ADD break-words */}
               {item.name}
               </div>
                <div className={`text-sm font-medium ${config.subTextStyle}`}>
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Strict Order: Red first (Priority), then Yellow, then Green */}
      <Section type="Red" items={grouped.Red} />
      <Section type="Yellow" items={grouped.Yellow} />
      <Section type="Green" items={grouped.Green} />
    </div>
  );
};

export default IngredientList;