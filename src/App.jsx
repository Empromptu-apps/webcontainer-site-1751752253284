import React, { useState, useEffect } from 'react';
import SpaceBattleship from './components/SpaceBattleship';
import ApiDebugger from './components/ApiDebugger';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🚀</span>
            SPACE BATTLESHIP
            <span className="text-4xl">🚀</span>
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <SpaceBattleship />
        <ApiDebugger />
      </div>
    </div>
  );
};

export default App;
