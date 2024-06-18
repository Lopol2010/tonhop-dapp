import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Web3Provider } from './components/Web3Provider.tsx'


import { Buffer } from 'buffer';
window.Buffer = Buffer;

  console.log(import.meta.env.MODE)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>,
)
