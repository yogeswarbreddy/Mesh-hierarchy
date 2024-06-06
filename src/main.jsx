// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container); // Create a root only once
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
