/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Enterprise SOC Palette (Phase A Visual Design System)
        soc: {
          bg: '#0A0D0E',         // Main workspace background
          sidebar: '#10161C',    // Dark sidebar surface
          surface: '#151D25',    // Card surfaces
          elevated: '#1B2630',   // Hover & elevated modals/cards
          border: '#2A3540',     // Subtle, crisp borders
          text: {
            primary: '#F1F5F9',  // Primary heading & body text
            secondary: '#94A3B8',// Secondary labels, subtitles
            muted: '#64748B',    // Subtle timestamps & footnotes
          },
          green: {
            DEFAULT: '#22C55E',  // Tactical Radar & Success
            dim: '#166534',
            faint: 'rgba(34, 197, 94, 0.1)',
          },
          amber: {
            DEFAULT: '#F59E0B',  // Warnings & Unverified Alerts
            dim: '#92400E',
            faint: 'rgba(245, 158, 11, 0.12)',
          },
          red: {
            DEFAULT: '#EF4444',  // Critical Alarms & Breaches
            dim: '#991B1B',
            faint: 'rgba(239, 68, 68, 0.12)',
          },
          blue: {
            DEFAULT: '#3B82F6',  // Intelligence & System Info
            dim: '#1E40AF',
            faint: 'rgba(59, 130, 246, 0.12)',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
