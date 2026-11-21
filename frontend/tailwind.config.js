/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Indian Defence-Inspired Palette
        prahaar: {
          darkest: '#0A0D0B',    // Pure Tactical Void
          charcoal: '#111713',   // Primary Container Background
          slate: '#1A231D',      // Card / Panel Background
          border: '#27382B',     // Card Borders & Separators
          olive: {
            light: '#4D6B53',
            DEFAULT: '#2F4835',
            dark: '#1C2C20',
          },
          radar: {
            glow: '#22C55E',
            dim: '#15803D',
            faint: '#052E16',
          },
          saffron: {
            DEFAULT: '#F59E0B',
            bright: '#FB923C',
            accent: '#EA580C',
          },
          alert: {
            red: '#EF4444',
            amber: '#F59E0B',
            blue: '#3B82F6',
            green: '#10B981',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
