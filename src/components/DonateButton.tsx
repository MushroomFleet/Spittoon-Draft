import { Heart } from 'lucide-react';

export function DonateButton() {
  return (
    <a
      href="https://ko-fi.com/driftjohnson"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[80px] right-[80px] sm:bottom-5 sm:right-5 z-40
                 w-12 h-12 rounded-full
                 bg-gradient-primary
                 flex items-center justify-center
                 opacity-70 hover:opacity-100
                 hover:scale-110
                 transition-all duration-300
                 shadow-elegant hover:shadow-glow
                 group"
      aria-label="Support this project on Ko-fi"
      title="Support this project ☕"
    >
      <Heart 
        className="w-5 h-5 text-white group-hover:fill-white transition-all duration-300" 
        strokeWidth={2}
      />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 
                      bg-card text-card-foreground text-sm font-medium
                      rounded-md shadow-elegant
                      opacity-0 group-hover:opacity-100
                      pointer-events-none
                      transition-opacity duration-200
                      whitespace-nowrap">
        Support this project ☕
        <div className="absolute top-full right-4 w-0 h-0 
                       border-l-4 border-r-4 border-t-4
                       border-l-transparent border-r-transparent 
                       border-t-card" />
      </div>
    </a>
  );
}
