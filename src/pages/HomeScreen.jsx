import React, { useState } from 'react';
import PieceCard from '../components/cards/PieceCard';
import GlazeCard from '../components/cards/GlazeCard';

// Tab card component matching the Figma design
function TabCard({ title, subtitle, variant, isActive, onClick, illustration }) {
  const variants = {
    pieces: 'bg-card-pieces',
    glaze: 'bg-card-glaze',
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden aspect-square rounded-2xl p-4 md:p-5
        text-left transition-all duration-200
        ${isActive ? variants[variant] + ' shadow-md' : 'bg-white shadow-sm'}
        cursor-pointer hover:shadow-lg
      `}
    >
      <div className="relative z-10 text-left">
        <h3 className={`text-lg md:text-xl font-semibold leading-tight ${isActive ? 'text-stone-800' : 'text-text-primary'}`}>
          {title}
        </h3>
        <p className={`text-sm md:text-base mt-0.5 ${isActive ? 'text-stone-700' : 'text-text-muted'}`}>
          {subtitle}
        </p>
      </div>
      {/* Illustration placeholder - can be positioned later */}
      {illustration && (
        <div className="absolute bottom-2 right-2 z-0 opacity-40">
          {illustration}
        </div>
      )}
    </button>
  );
}

function HomeScreen({
  username = 'Hannah',
  projects = [],
  glazes = [],
  onPieceClick,
  onGlazeClick
}) {
  const [activeTab, setActiveTab] = useState('pieces');

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8 md:px-8 lg:px-12">
        {/* Greeting Section */}
        <div className="mb-6 text-left">
          <p className="text-text-secondary text-lg mb-1">
            Hello, {username}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
            What are we<br className="md:hidden" /> making today?
          </h1>
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
          <TabCard
            title="Pieces"
            subtitle="Throw & build"
            variant="pieces"
            isActive={activeTab === 'pieces'}
            onClick={() => setActiveTab('pieces')}
          />
          <TabCard
            title="Glaze garden"
            subtitle="Get mixing"
            variant="glaze"
            isActive={activeTab === 'glaze'}
            onClick={() => setActiveTab('glaze')}
          />
        </div>

        {/* Content Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activeTab === 'pieces' ? (
            <>
              {projects.map((piece) => (
                <PieceCard
                  key={piece.id}
                  piece={piece}
                  onClick={() => onPieceClick && onPieceClick(piece)}
                />
              ))}
              {projects.length === 0 && (
                <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 bg-white rounded-2xl border border-stone-200">
                  <p className="text-text-muted">No pieces yet. Start creating!</p>
                </div>
              )}
            </>
          ) : (
            <>
              {glazes.map((glaze) => (
                <GlazeCard
                  key={glaze.id}
                  glaze={glaze}
                  onClick={() => onGlazeClick && onGlazeClick(glaze)}
                />
              ))}
              {glazes.length === 0 && (
                <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 bg-white rounded-2xl border border-stone-200">
                  <p className="text-text-muted">No glazes yet. Start mixing!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
