import { TonConnectButton } from '@tonconnect/ui-react';
import { ChainName } from '../types/ChainName';
import { ConnectKitButton } from 'connectkit';

interface NavbarProps {
  fromNetwork: ChainName,
}
export const Navbar: React.FC<NavbarProps> = ({ fromNetwork }) => {
  const isDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <nav className="p-5 flex justify-between bg-gray-100 dark:bg-gray-800 border-b border-solid border-gray-300 dark:border-gray-600">
      <div className="flex items-center font-semibold text-2xl">TONHOP</div>
      <div className="">
        {
          fromNetwork == ChainName.TON
            ? <TonConnectButton></TonConnectButton>
            : <ConnectKitButton customTheme={{
              "--ck-connectbutton-background": isDarkMode() ? "rgb(55 65 81)" : "#ddd",
            }}></ConnectKitButton>
        }
        {/* <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
          return (
            <button onClick={show} className='bg-gray-300'> Connect Wallet </button>
          );
        }}
      </ConnectKitButton.Custom> */}
      </div>
    </nav>
  );
}

export default Navbar;

