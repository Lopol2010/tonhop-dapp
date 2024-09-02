import { WagmiProvider, createConfig, createStorage, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { networkConfig } from "../networkConfig";

const defaultConfig = getDefaultConfig({
  // Your dApps chains
  chains: [networkConfig.bnb.chain],
  transports: {
    // RPC URL for each chain
    [networkConfig.bnb.chain.id]: http(
      // `${import.meta.env.VITE_BSC_RPC_URL}`,
    ),
  },
  storage: createStorage({ key: networkConfig.wagmiStorageKey }),

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

export const Web3Provider = ({ children }: React.PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};