// src/components/Navbar.js

import './Navbar.css';
import { ConnectKitButton } from 'connectkit';

export const Navbar = () => {
  return (
    <nav className="p-5 flex justify-between bg-gray-100 dark:bg-gray-800 border-b border-solid border-gray-300 dark:border-gray-600">
      <div className="flex items-center font-semibold text-2xl">TONHOP</div>
      {/* <div className="nav-links">
      </div>
      <div className="nav-actions">
        <a href="#">ENG</a>
        <a href="#">ETH: 0x253...da159</a>
        <button className="button">Change wallet</button>
      </div> */}
      <div className="">
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

