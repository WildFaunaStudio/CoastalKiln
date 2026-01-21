import React from 'react';

// SVG illustrations for feature cards
const CardIllustrations = {
  // Ceramic bowl shape (U-shape) for Pieces
  pieces: (
    <svg viewBox="0 0 120 80" className="w-24 h-16 opacity-40">
      <path
        d="M20 20 Q20 60 60 60 Q100 60 100 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Triangle shape for Glaze Garden
  glaze: (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-50">
      <polygon
        points="40,15 70,65 10,65"
        fill="currentColor"
      />
    </svg>
  ),

  // Leaf shape for Reclaim/Sustainable
  reclaim: (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-40">
      <path
        d="M40 10 Q60 30 60 50 Q60 70 40 70 Q20 70 20 50 Q20 30 40 10"
        fill="currentColor"
      />
    </svg>
  ),

  // Group icon for Guilds
  guilds: (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-40">
      <circle cx="40" cy="25" r="12" fill="currentColor" />
      <circle cx="22" cy="35" r="8" fill="currentColor" />
      <circle cx="58" cy="35" r="8" fill="currentColor" />
      <path d="M20 55 Q40 45 60 55 L60 70 L20 70 Z" fill="currentColor" />
    </svg>
  ),
};

function FeatureCard({
  title,
  subtitle,
  variant = 'default',
  illustration,
  onClick,
  disabled = false,
  className = '',
}) {
  const variantStyles = {
    pieces: 'bg-card-pieces text-stone-800',
    glaze: 'bg-card-glaze text-teal-800',
    reclaim: 'bg-card-reclaim text-green-800',
    guilds: 'bg-card-guilds text-rose-900',
    default: 'bg-white text-text-primary border border-stone-200',
  };

  const baseStyles = `
    relative overflow-hidden
    aspect-square rounded-2xl
    p-4 md:p-5 flex flex-col justify-start
    text-left
    transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'}
    ${variantStyles[variant] || variantStyles.default}
    ${className}
  `;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={baseStyles}
    >
      {/* Card content */}
      <div className="relative z-10 text-left">
        {title && (
          <h3 className="text-lg md:text-xl font-semibold leading-tight text-left">{title}</h3>
        )}
        {subtitle && (
          <p className={`text-sm md:text-base mt-0.5 text-left ${variant === 'default' ? 'text-text-muted' : 'opacity-80'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Illustration */}
      {illustration && CardIllustrations[illustration] && (
        <div className="absolute bottom-2 right-2 z-0">
          {CardIllustrations[illustration]}
        </div>
      )}
    </button>
  );
}

export default FeatureCard;
