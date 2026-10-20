import { useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { injected, walletConnect, coinbaseWallet, metaMask } from '@wagmi/connectors'

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
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.159 9.596c1.718-1.687 4.369-1.957 6.374-.834.252.141.49.293.717.455.136.098.268.2.396.306l.279.236.086.076.03.028c.016.015.03.029.045.044.148.145.29.295.425.45.058.066.114.134.169.203.11.137.215.278.313.423.049.072.096.145.141.219.09.147.174.297.25.45.038.076.074.153.108.231.068.156.129.315.182.476.026.08.051.161.074.242.046.161.084.324.113.489.014.082.027.164.038.247.022.165.036.332.042.5.003.083.005.166.005.25 0 .083-.002.166-.005.25-.006.168-.02.335-.042.5-.011.083-.024.165-.038.247-.029.165-.067.328-.113.489-.023.081-.048.162-.074.242-.053.161-.114.32-.182.476-.034.078-.07.155-.108.231-.076.153-.16.303-.25.45-.045.074-.092.147-.141.219-.098.145-.203.286-.313.423-.055.069-.111.137-.169.203-.135.155-.277.305-.425.45-.015.015-.029.029-.045.044l-.03.028-.086.076-.279.236c-.128.106-.26.208-.396.306-.227.162-.465.314-.717.455-2.005 1.123-4.656.853-6.374-.834-.07-.068-.138-.138-.204-.21-.132-.144-.257-.293-.375-.447-.059-.077-.116-.155-.171-.235-.11-.16-.213-.324-.308-.492-.047-.084-.093-.169-.136-.255-.086-.172-.165-.347-.235-.525-.035-.089-.068-.178-.099-.268-.062-.18-.116-.362-.162-.546-.023-.092-.044-.185-.063-.278-.038-.185-.068-.372-.09-.56-.011-.094-.021-.188-.028-.283-.014-.188-.021-.377-.021-.567 0-.19.007-.379.021-.567.007-.095.017-.189.028-.283.022-.188.052-.375.09-.56.019-.093.04-.186.063-.278.046-.184.1-.366.162-.546.031-.09.064-.179.099-.268.07-.178.149-.353.235-.525.043-.086.089-.171.136-.255.095-.168.198-.332.308-.492.055-.08.112-.158.171-.235.118-.154.243-.303.375-.447.066-.072.134-.142.204-.21zm5.008 4.804c-.143-.14-.375-.14-.518 0l-.06.058c-.143.14-.143.368 0 .508l1.59 1.557c.143.14.375.14.518 0l1.59-1.557c.143-.14.143-.368 0-.508l-.06-.058c-.143-.14-.375-.14-.518 0l-.763.748-.763-.748zm-3.726-3.646c-.143-.14-.375-.14-.518 0l-.06.058c-.143.14-.143.368 0 .508l1.59 1.557c.143.14.375.14.518 0l1.59-1.557c.143-.14.143-.368 0-.508l-.06-.058c-.143-.14-.375-.14-.518 0l-.763.748-.763-.748z" />
                      </svg>
                    )}
                    {connector.id === 'coinbaseWallet' && (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                    )}
                    {connector.id === 'metaMask' && (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.5 3.5L12 10l-1.5-1L20.5 3.5zM3.5 3.5L12 10l1.5-1L3.5 3.5zM12 10l-1.5 1L12 20.5l1.5-9.5L12 10z" />
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
