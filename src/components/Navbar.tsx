// src/components/Navbar.js

import './Navbar.css';
import { ConnectKitButton } from 'connectkit';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">TONHOP</div>
      {/* <div className="nav-links">
      </div>
      <div className="nav-actions">
        <a href="#">ENG</a>
        <a href="#">ETH: 0x253...da159</a>
        <button className="button">Change wallet</button>
      </div> */}
      <div className="navbar-items">
        {/* <div className="language-selector"> */}
          {/* <img src="path/to/us-flag.png" alt="US Flag" /> */}
          {/* <span>ENG</span> */}
          {/* <i className="arrow-down"></i> */}
        {/* </div> */}
        {/* <div className="wallet-info">
          <img src="path/to/crypto-logo.png" alt="Crypto Logo" />
          <span>ETH: 0x253...da159</span>
        </div>
        <button className="change-wallet">Change wallet</button> */}
        <ConnectKitButton></ConnectKitButton>
      </div>
    </nav>
  );
}

export default Navbar;

