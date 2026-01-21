// Coastal Kiln Design System
// Warm, earthy color palette with a calm, crafted feel

export const colors = {
  // Primary backgrounds
  background: {
    cream: '#F5F1E8',
    white: '#FFFFFF',
  },

  // Feature card backgrounds
  cards: {
    pieces: '#C4A77D',       // Warm tan/terracotta
    glazeGarden: '#7DD3C4',  // Soft teal/aqua
    reclaim: '#B8D4B8',      // Sage green
    guilds: '#D4B8B8',       // Soft rose/terracotta
    kiln: '#D4C4A8',         // Light tan
    tips: '#A8C4D4',         // Soft blue
  },

  // Text colors
  text: {
    primary: '#2D2A26',      // Dark charcoal for headlines
    secondary: '#8B7355',    // Muted brown for greeting
    muted: '#6B6560',        // Muted for subtitles
    onDark: '#FFFFFF',       // White text on dark backgrounds
    onLight: '#4A4540',      // Dark text on light cards
  },

  // UI colors
  ui: {
    border: '#E8E4DC',
    shadow: 'rgba(139, 115, 85, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Accent colors
  accent: {
    primary: '#D4A574',      // Primary brand orange
    hover: '#C49464',
  },

  // Stage colors for pottery tracking
  stages: {
    wedging: { bg: '#FEF3C7', text: '#92400E' },
    throwing: { bg: '#FFEDD5', text: '#9A3412' },
    trimming: { bg: '#FEF9C3', text: '#854D0E' },
    drying: { bg: '#ECFCCB', text: '#3F6212' },
    bisque: { bg: '#CFFAFE', text: '#0E7490' },
    glazing: { bg: '#FCE7F3', text: '#9D174D' },
    firing: { bg: '#F3E8FF', text: '#7C3AED' },
    complete: { bg: '#DCFCE7', text: '#166534' },
  },
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Font sizes
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(139, 115, 85, 0.05)',
  md: '0 4px 6px -1px rgba(139, 115, 85, 0.1), 0 2px 4px -1px rgba(139, 115, 85, 0.06)',
  lg: '0 10px 15px -3px rgba(139, 115, 85, 0.1), 0 4px 6px -2px rgba(139, 115, 85, 0.05)',
};
