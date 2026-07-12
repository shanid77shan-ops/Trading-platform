import { createAppKit, type AppKit } from "@reown/appkit/react";
import {
  metadata,
  networks,
  projectId,
  wagmiAdapter,
} from "@/config";

let appKitInstance: AppKit | null = null;

export function getAppKit() {
  if (appKitInstance) return appKitInstance;

  appKitInstance = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId: projectId || "00000000000000000000000000000000",
    metadata,
    themeMode: "dark",
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    themeVariables: {
      "--apkt-color-mix": "#4a5d75",
      "--apkt-color-mix-strength": 20,
      "--apkt-font-family": "var(--font-geist-sans), system-ui, sans-serif",
      "--apkt-accent": "#6b8cae",
    },
  });

  return appKitInstance;
}

export function openWalletModal() {
  getAppKit().open();
}
