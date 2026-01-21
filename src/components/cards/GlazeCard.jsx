import React from 'react';
import { Palette } from 'lucide-react';

function GlazeCard({ glaze, onClick }) {
  const { name, type, tiles } = glaze;
  const hasPhoto = tiles && tiles.length > 0;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden text-left transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-stone-200"
    >
      {/* Image area */}
      <div className="aspect-square bg-cream flex items-center justify-center overflow-hidden">
        {hasPhoto ? (
          <img
            src={tiles[0].url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Palette size={40} className="text-stone-300" />
        )}
      </div>

      {/* Info area */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-text-primary text-sm md:text-base truncate">
          {name}
        </h3>
        <p className="text-xs md:text-sm text-text-secondary truncate">
          {type}
        </p>
      </div>
    </button>
  );
}

export default GlazeCard;
