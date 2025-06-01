import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import your CSS for Tailwind directives and animations
import App from './App'; // Import your App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
