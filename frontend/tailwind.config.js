/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#24340c",
        secondary: "#6d5c3c",
        surface: "#fff8f2",
        "surface-low": "#fff2df",
        accent: "#660013",
        // Additional semantic colors
        "primary-dark": "#1a2608",
        "primary-light": "#2e4210",
        "secondary-dark": "#4a3d28",
        "secondary-light": "#8a7a5a",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      borderRadius: {
        xl: "2rem",
        "2xl": "3rem",
        // Additional border radius options
        lg: "1.5rem",
        md: "1rem",
        sm: "0.75rem",
      },
      fontFamily: {
        serif: ["Noto Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      // Add animation utilities
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Add spacing utilities
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      // Add box shadow variants
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      // Add backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Add line clamp utilities
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [
    // Add line-clamp plugin if needed (install: npm install @tailwindcss/line-clamp)
    // require('@tailwindcss/line-clamp'),
  ],
}