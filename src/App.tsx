import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Navbar } from './components/Navbar';
import TransferAssets from './components/TransferAssets';

function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      <TransferAssets></TransferAssets>
    </div>
  );
}

export default App;
