import React, { useState, useEffect } from 'react';

function WelcomeScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-cream flex flex-col items-center justify-center z-50 transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-6">
        <img
          src="/CoastalKilnLogo.png"
          alt="Coastal Kiln"
          className="w-48 h-48 animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        <h1 className="text-3xl font-bold text-text-primary">Coastal Kiln</h1>
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
