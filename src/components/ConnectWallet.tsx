import { useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false)
  const { connect, connectors, isPending } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary px-4 py-2 rounded-lg text-sm text-emerald-400 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          {formatAddress(address)}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl p-4 z-50 border border-emerald-500/20">
              <div className="mb-3 pb-3 border-b border-emerald-500/10">
                <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
                <div className="text-sm font-mono text-white break-all">{address}</div>
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary px-4 py-2 rounded-lg text-sm text-white font-medium"
      >
        Connect Wallet
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md border border-emerald-500/20">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-sm text-gray-400 mb-6">Choose your preferred wallet to connect</p>

            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setIsOpen(false)
                  }}
                  disabled={isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    {connector.id === 'injected' && (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {connector.id === 'walletConnect' && (
                      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                        <circle cx="9" cy="12" r="1.5"/>
                        <circle cx="15" cy="12" r="1.5"/>
                      </svg>
                    )}
                    {connector.id === 'coinbaseWallet' && (
                      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    {connector.id === 'metaMask' && (
                      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 3L12 10l-2-1.5L21 3zM3 3l9 7 2-1.5L3 3zM12 10l-2 1L12 21l2-10-2-1z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">
                      {connector.id === 'injected' && 'Browser Wallet'}
                      {connector.id === 'walletConnect' && 'WalletConnect'}
                      {connector.id === 'coinbaseWallet' && 'Coinbase Wallet'}
                      {connector.id === 'metaMask' && 'MetaMask'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {connector.id === 'injected' && 'MetaMask, Trust Wallet, etc.'}
                      {connector.id === 'walletConnect' && 'Scan with mobile wallet'}
                      {connector.id === 'coinbaseWallet' && 'Coinbase Wallet app'}
                      {connector.id === 'metaMask' && 'MetaMask browser extension'}
                    </div>
                  </div>
                  {isPending && (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/10">
              <p className="text-xs text-gray-500 text-center">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
