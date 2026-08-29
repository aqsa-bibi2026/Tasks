import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { queryClient } from './queryClient.js';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
);
