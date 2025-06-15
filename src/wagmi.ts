import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { injected } from "@wagmi/connectors";
import { localhost, arbitrum, arbitrumSepolia } from "./viemChains";

// Use Nitro localhost in development/debug mode, otherwise use Arbitrum mainnets
type Chain = typeof localhost | typeof arbitrum | typeof arbitrumSepolia;

const isDev = process.env.NODE_ENV === "development" || process.env.VITE_USE_LOCALHOST === "true";

// Wagmi createConfig expects a non-empty tuple for chains, so we assert as const
const chains = (isDev ? [localhost, arbitrum, arbitrumSepolia] : [arbitrum, arbitrumSepolia]) as [Chain, ...Chain[]];

const transports = chains.reduce((acc, chain) => {
  acc[chain.id] = http(chain.rpcUrls.default.http[0]);
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

export const config = createConfig({
  chains,
  connectors: isDev ? [injected(), farcasterFrame()] : [farcasterFrame()],
  transports,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
