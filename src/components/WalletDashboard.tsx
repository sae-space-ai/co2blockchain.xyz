import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, polygon, arbitrum, base, optimism } from 'wagmi/chains'

const CHAINS = [mainnet, polygon, arbitrum, base, optimism]

export function WalletDashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Get native token balance (ETH, MATIC, etc.)
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
  })

  if (!isConnected || !address) return null

  const currentChain = CHAINS.find(c => c.id === chainId) || mainnet

  return (
    <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white">Your Wallet</div>
            <div className="text-xs font-mono text-gray-500">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Connected</span>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-500 mb-1">Balance</div>
        {nativeLoading ? (
          <div className="h-8 bg-gray-800 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {nativeBalance ? (Number(nativeBalance.value) / Math.pow(10, nativeBalance.decimals)).toFixed(4) : '0.0000'}
            </span>
            <span className="text-sm text-gray-400">{nativeBalance?.symbol || 'ETH'}</span>
          </div>
        )}
      </div>

      {/* Network */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Network</div>
        <div className="flex flex-wrap gap-2">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => switchChain?.({ chainId: chain.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chain.id === chainId
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-black/30 text-gray-500 border border-gray-800 hover:border-emerald-500/20 hover:text-gray-300'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black/30 border border-emerald-500/10 text-xs text-gray-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Explorer
        </a>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buy Credits
        </button>
      </div>
    </div>
  )
}
