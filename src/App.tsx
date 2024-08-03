import './App.css';
import MainTransferPanel from './components/MainTransferPanel';
import {Navbar } from './components/Navbar';
import TransferAssetsTab from './components/TransferAssetsTab';

function App() {
  return (
    <div className="App dark:bg-gray-700 h-full text-black dark:text-gray-300">
      <Navbar></Navbar>
      <MainTransferPanel></MainTransferPanel>
    </div>
  );
}

export default App;
