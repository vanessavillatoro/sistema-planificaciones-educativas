import React from 'react';

const ThemeToggle = ({ darkMode, setDarkMode }) => {
return (
    <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
    {darkMode ? '☀️' : '🌙'}
    </button>
);
};

export default ThemeToggle;