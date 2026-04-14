import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Global fetch wrapper to proxy /api requests to the production backend
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api')) {
        const backendUrl = import.meta.env.PROD ? 'https://server-nine-mu-70.vercel.app' : '';
        resource = backendUrl + resource;
    }
    return originalFetch(resource, config);
};
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
