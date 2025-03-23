import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, sepolia } from "wagmi/chains";
import { http } from "viem";
import { cookieStorage, createStorage } from "wagmi";
export const wagmiConfig = getDefaultConfig({
  appName: "Melody Coin App",
  projectId: "498500e3e80ce6193ca0689298b8f632",
  chains: [sepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
});
