// viemChains.ts
// Custom chain config for viem, including Nitro Localhost for Stylus dev
import { defineChain } from 'viem';

export const localhost = defineChain({
  id: 412346,
  name: 'Nitro Localhost',
  network: 'Nitro localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8547'],
      webSocket: ['ws://localhost:8547'],
    },
    public: {
      http: ['http://localhost:8547'],
      webSocket: ['ws://localhost:8547'],
    },
  },
  testnet: false,
});

// Export standard Arbitrum One and Sepolia chains for use in prod/test
import { arbitrum, arbitrumSepolia } from 'viem/chains';
export { arbitrum, arbitrumSepolia };
