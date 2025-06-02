import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si deseas medir el rendimiento de tu aplicación, pasa una función
// para registrar los resultados (por ejemplo: reportWebVitals(console.log))
// o envía a un endpoint de analytics. Aprende más: https://bit.ly/CRA-vitals
reportWebVitals();
