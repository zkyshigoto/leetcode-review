import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ReviewView from './pages/ReviewView';
import './App.css';

// Key Storage Helper
const KEY_STORAGE = 'llm_api_key';
const BASE_URL_STORAGE = 'llm_base_url';
const MODEL_STORAGE = 'llm_model';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem(KEY_STORAGE) || '');
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem(BASE_URL_STORAGE) || 'https://api.openai.com/v1');
  const [model, setModel] = useState(localStorage.getItem(MODEL_STORAGE) || 'gpt-4o-mini');
  const [isConfigOpen, setIsConfigOpen] = useState(!localStorage.getItem(KEY_STORAGE));

  const saveConfig = () => {
    localStorage.setItem(KEY_STORAGE, apiKey);
    localStorage.setItem(BASE_URL_STORAGE, baseUrl);
    localStorage.setItem(MODEL_STORAGE, model);
    setIsConfigOpen(false);
  };

  return (
    <Router>
      <div className="app-layout">
        <header className="main-header">
          <div className="container header-content">
            <h1 className="logo">LeetCode Review AI</h1>
            <button className="btn btn-ghost" onClick={() => setIsConfigOpen(true)}>
              <Key size={18} />
              <span>Config</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review/:problemId" element={<ReviewView apiKey={apiKey} baseUrl={baseUrl} model={model} />} />
          </Routes>
        </main>

        {isConfigOpen && (
          <div className="modal-overlay">
            <div className="modal card">
              <h2>LLM Configuration</h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Base URL</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Model Name</label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <small style={{ color: 'var(--text-secondary)' }}>e.g. gpt-4o, deepseek-chat, qwen-turbo</small>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={saveConfig}>Save & Continue</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
