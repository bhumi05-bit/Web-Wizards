/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F1',
        paperElevated: '#FFFFFF',
        ink: '#1C1B19',
        inkMuted: '#68645E',
        burgundy: '#7A2E3A',
        moss: '#2F5D50',
        mossDark: '#1E3F36',
        mossLight: '#437B6B',
        mossNeon: '#10B981',
        clay: '#B5533C',
        clayLight: '#F87171',
        line: '#E8E3D7',
        // Dark mode palette
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkCardElevated: '#283548',
        darkLine: '#334155',
        darkInk: '#F8FAFC',
        darkInkMuted: '#94A3B8'
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
