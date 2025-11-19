/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Custom colors matching your existing theme
        'obsidian-bg': '#0a0a0a',
        'obsidian-card': '#1a1a1a',
        'obsidian-border': '#333',
        'obsidian-text': '#ECEDEE',
        'obsidian-text-muted': '#999',
        'obsidian-green': '#4CAF50',
        'obsidian-red': '#f44336',
        'obsidian-orange': '#FF9800',
        'obsidian-blue': '#2196F3',
      },
    },
  },
  plugins: [],
};

