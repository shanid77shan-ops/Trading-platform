import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, polygon, type AppKitNetwork } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

export const networks = [mainnet, polygon] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

export const metadata = {
  name: "TradeHub",
  description: "Professional mobile trading platform",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://trading-app-blue.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: projectId || "00000000000000000000000000000000",
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
