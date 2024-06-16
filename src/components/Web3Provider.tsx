import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const defaultConfig = getDefaultConfig({
  // Your dApps chains
  chains: [bscTestnet],
  transports: {
    // RPC URL for each chain
    [bscTestnet.id]: http(
      `${import.meta.env.VITE_ALCHEMY_ID}`,
    ),
  },

  // Required API Keys
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "",

  // Required App Info
  appName: "Tonhop Dapp",

  // Optional App Info
  // appDescription: "Your App Description",
  // appUrl: "https://family.co", // your app's url
  // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
});

const config = createConfig(defaultConfig);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};