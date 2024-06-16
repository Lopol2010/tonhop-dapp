// src/NetworkSelector.js

import React, { useState } from 'react';
import './NetworkSelector.css';

const NetworkSelector = () => {
  const [fromNetwork, setFromNetwork] = useState('Binance Smart Chain');
  const [toNetwork, setToNetwork] = useState('TON');

  const handleSwap = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  }

  return (
    <div className="network-selector">
      <div className="network-block">
        <label>From:</label>
        <select value={fromNetwork} onChange={e => setFromNetwork(e.target.value)}>
          {/* <option value="Ethereum Network">Ethereum Network</option> */}
          <option value="Binance Smart Chain">Binance Smart Chain</option>
          {/* <option value="Polygon Network">Polygon Network</option> */}
          {/* <option value="TON">TON Network</option> */}
          {/* Add more options as necessary */}
        </select>
      </div>
      <button className="swap-button" onClick={handleSwap}>⇆</button>
      <div className="network-block">
        <label>To:</label>
        <select value={toNetwork} onChange={e => setToNetwork(e.target.value)}>
          {/* <option value="Ethereum Network">Ethereum Network</option> */}
          {/* <option value="Binance Smart Chain">Binance Smart Chain</option> */}
          {/* <option value="Polygon Network">Polygon Network</option> */}
          <option value="TON">TON Network</option>
          {/* Add more options as necessary */}
        </select>
      </div>
    </div>
  );
}

export default NetworkSelector;
