import './App.css';
import {Navbar } from './components/Navbar';
import TransferAssets from './components/TransferAssets';

function App() {
  return (
    <div className="App dark:bg-gray-700 h-full text-black dark:text-gray-300">
      <Navbar></Navbar>
      <TransferAssets></TransferAssets>
    </div>
  );
}

export default App;
