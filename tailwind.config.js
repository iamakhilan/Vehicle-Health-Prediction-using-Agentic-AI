/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          clay: '#D95D39', // Primary actions, FABs
          ink: '#1C1C1E',  // Primary text
        },
        secondary: {
          sand: '#F2F0ED', // App background
          peach: '#FCECE8', // Hover, active tabs
        },
        accent: {
          indigo: '#5B5F97', // AI/Reflection
          teal: '#488B86',   // Tagging, success
        },
        functional: {
          success: '#3D8856',
          error: '#CF423C',
          stone: '#8E8E93', // Secondary text, borders
          mist: '#E5E5EA',  // Dividers
        },
        background: {
          surface: '#FFFFFF',
          sand: '#F2F0ED',
          dark: '#121212',
        }
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'], // Simulating SF Pro Rounded
        serif: ['"Merriweather"', 'serif'], // Simulating New York
      },
      borderRadius: {
        'pill': '28px',
        'super-ellipse': '16px',
        'card': '24px',
      },
      boxShadow: {
        'glow': '0 4px 12px rgba(217, 93, 57, 0.25)',
        'float': '0 8px 24px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      }
    },
  },
  plugins: [],
}
