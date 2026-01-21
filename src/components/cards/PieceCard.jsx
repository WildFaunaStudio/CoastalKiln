import React from 'react';
import { Flame } from 'lucide-react';

const stageColors = {
  wedging: 'bg-amber-100 text-amber-800',
  throwing: 'bg-orange-100 text-orange-800',
  trimming: 'bg-yellow-100 text-yellow-800',
  drying: 'bg-lime-100 text-lime-800',
  bisque: 'bg-cyan-100 text-cyan-800',
  glazing: 'bg-pink-100 text-pink-800',
  firing: 'bg-purple-100 text-purple-800',
  complete: 'bg-green-100 text-green-800',
};

const formatStage = (stage) => stage.charAt(0).toUpperCase() + stage.slice(1);

function PieceCard({ piece, onClick }) {
  const { title, clay, stage, photos } = piece;
  const hasPhoto = photos && photos.length > 0;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden text-left transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-stone-200"
    >
      {/* Image area */}
      <div className="aspect-square bg-cream flex items-center justify-center overflow-hidden">
        {hasPhoto ? (
          <img
            src={photos[0].url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Flame size={40} className="text-stone-300" />
        )}
      </div>

      {/* Info area */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-text-primary text-sm md:text-base truncate">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-text-secondary truncate">
          {clay}
        </p>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${stageColors[stage]}`}>
          {formatStage(stage)}
        </span>
      </div>
    </button>
  );
}

export default PieceCard;
