import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, base, optimism } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet, metaMask } from '@wagmi/connectors'

// WalletConnect Project ID (obtener en https://cloud.walletconnect.com)
const WALLETCONNECT_PROJECT_ID = '3fbb2d6f2f3a5b8c9d0e1f2a3b4c5d6e' // Demo ID

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism],
  connectors: [
    injected(),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
    coinbaseWallet({ appName: 'CO2Chain' }),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
