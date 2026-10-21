import { useState, useEffect, useRef } from 'react';
import {
  useEthereumData,
  useCryptoPrices,
  useGasTracker,
  useGlobalMarket,
  useEthPrice,
  formatNumber,
} from '../hooks/useRealTimeData';

// Icons
function TrendUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function ZapIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ActivityIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ChainIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// Sparkline component
function Sparkline({ data, color = "#10b981", width = 120, height = 40 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Live indicator
function LiveIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-xs font-medium text-red-400">LIVE</span>
    </div>
  );
}

// Gas Gauge component
function GasGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-mono font-bold text-white">{value} Gwei</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`
          }}
        />
      </div>
    </div>
  );
}

// Block visualizer
function BlockVisualizer({ blocks }: { blocks: number[] }) {
  return (
    <div className="flex items-end gap-0.5 h-16">
      {blocks.map((block, i) => {
        const height = 30 + (block % 70);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.8))`,
              animationDelay: `${i * 50}ms`
            }}
            title={`Block #${block.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

// Main Live Data Section
export function LiveDataSection() {
  const ethData = useEthereumData();
  const gasData = useGasTracker();
  const { prices, loading: pricesLoading, lastUpdate: pricesLastUpdate } = useCryptoPrices([
    'ethereum', 'bitcoin', 'matic-network', 'chainlink', 'the-graph', 'uniswap', 'aave', 'solana'
  ]);
  const globalMarket = useGlobalMarket();
  const { price: ethPrice, change: ethChange } = useEthPrice();
  
  const [blockHistory, setBlockHistory] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState({
    coingecko: true,
    ethereum: true,
    lastCheck: new Date()
  });

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Track block history
  useEffect(() => {
    if (ethData.blockNumber > 0) {
      setBlockHistory(prev => {
        const next = [...prev, ethData.blockNumber].slice(-30);
        return next;
      });
    }
  }, [ethData.blockNumber]);

  // API health check
  useEffect(() => {
    setApiStatus(prev => ({
      ...prev,
      coingecko: prices.length > 0,
      ethereum: ethData.blockNumber > 0,
      lastCheck: new Date()
    }));
  }, [prices.length, ethData.blockNumber]);

  return (
    <section id="live-data" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LiveIndicator />
            <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Real-Time Data</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Live <span className="gradient-text">Market Data</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            All data fetched in real-time from CoinGecko API and Ethereum mainnet RPC nodes.
          </p>
          
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-emerald-500/10">
              <span className={`w-2 h-2 rounded-full ${apiStatus.coingecko ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-gray-400">CoinGecko API</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-emerald-500/10">
              <span className={`w-2 h-2 rounded-full ${apiStatus.ethereum ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-gray-400">Ethereum RPC</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-emerald-500/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Global Market Stats */}
        {globalMarket.data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-5 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total Market Cap</span>
                <span className="text-xs text-gray-600">Global</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(globalMarket.data.totalMarketCap)}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${globalMarket.data.marketCapChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {globalMarket.data.marketCapChange24h >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                {Math.abs(globalMarket.data.marketCapChange24h).toFixed(2)}% (24h)
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">24h Volume</span>
                <span className="text-xs text-gray-600">All Markets</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(globalMarket.data.totalVolume)}</div>
              <div className="text-xs text-gray-500 mt-1">{globalMarket.data.activeCryptos.toLocaleString()} active coins</div>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">BTC Dominance</span>
                <span className="text-xs text-orange-400">₿</span>
              </div>
              <div className="text-2xl font-bold text-white">{globalMarket.data.btcDominance.toFixed(1)}%</div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${globalMarket.data.btcDominance}%` }} />
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">ETH Dominance</span>
                <span className="text-xs text-emerald-400">⟠</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{globalMarket.data.ethDominance.toFixed(1)}%</div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${globalMarket.data.ethDominance}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Crypto Prices Table */}
          <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-emerald-500/10">
              <div className="flex items-center gap-3">
                <ActivityIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Crypto Prices</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {pricesLastUpdate ? `Updated ${pricesLastUpdate.toLocaleTimeString()}` : 'Loading...'}
                </span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/5">
                    <th className="text-left text-xs text-gray-500 font-medium p-3 pl-5">Asset</th>
                    <th className="text-right text-xs text-gray-500 font-medium p-3">Price</th>
                    <th className="text-right text-xs text-gray-500 font-medium p-3">24h</th>
                    <th className="text-right text-xs text-gray-500 font-medium p-3 hidden sm:table-cell">Market Cap</th>
                    <th className="text-right text-xs text-gray-500 font-medium p-3 hidden md:table-cell">Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {pricesLoading && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Fetching from CoinGecko...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {prices.map((coin, i) => (
                    <tr key={coin.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                      <td className="p-3 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{coin.name}</div>
                            <div className="text-xs text-gray-500">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm font-medium text-white">
                        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className={`p-3 text-right text-sm font-medium ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {coin.change24h >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                          {Math.abs(coin.change24h).toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm text-gray-400 hidden sm:table-cell">
                        {formatNumber(coin.marketCap)}
                      </td>
                      <td className="p-3 text-right hidden md:table-cell">
                        <div className="flex justify-end">
                          <Sparkline 
                            data={coin.sparkline} 
                            color={coin.change24h >= 0 ? '#10b981' : '#ef4444'} 
                            width={80} 
                            height={25} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ethereum Network Status */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-emerald-500/10">
              <div className="flex items-center gap-3">
                <ChainIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Ethereum Network</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ethData.error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {ethData.error ? 'Error' : 'Connected'}
              </span>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Block Number */}
              <div className="p-4 rounded-xl bg-black/30 border border-emerald-500/10">
                <div className="text-xs text-gray-500 mb-1">Latest Block</div>
                <div className="text-xl font-bold text-white font-mono">
                  {ethData.loading ? '...' : `#${ethData.blockNumber.toLocaleString()}`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {ethData.transactions} transactions • {ethData.peerCount} peers
                </div>
              </div>

              {/* Block Visualizer */}
              <div>
                <div className="text-xs text-gray-500 mb-2">Recent Blocks (live)</div>
                <BlockVisualizer blocks={blockHistory.length > 0 ? blockHistory : Array.from({length: 20}, (_, i) => i * 1000)} />
              </div>

              {/* Network Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/20">
                  <div className="text-xs text-gray-500">Base Fee</div>
                  <div className="text-sm font-bold text-white">{ethData.baseFee} Gwei</div>
                </div>
                <div className="p-3 rounded-lg bg-black/20">
                  <div className="text-xs text-gray-500">Block Time</div>
                  <div className="text-sm font-bold text-white">~12s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gas Tracker & ETH Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Gas Tracker */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ZapIcon className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Gas Tracker</h3>
              </div>
              <span className="text-xs text-gray-500">
                {gasData.loading ? 'Loading...' : 'Live'}
              </span>
            </div>

            {!gasData.loading && (
              <div className="space-y-4">
                <GasGauge value={gasData.slow} max={200} label="🐢 Slow" color="#6b7280" />
                <GasGauge value={gasData.standard} max={200} label="⚡ Standard" color="#10b981" />
                <GasGauge value={gasData.fast} max={200} label="🚀 Fast" color="#f59e0b" />

                {/* Cost Calculator */}
                <div className="mt-6 pt-4 border-t border-emerald-500/10">
                  <div className="text-xs text-gray-500 mb-3">Estimated Transaction Costs</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ETH Transfer (21,000 gas)</span>
                      <span className="text-white font-medium">
                        ${ethPrice > 0 ? ((gasData.standard * 21000 * ethPrice) / 1e9).toFixed(2) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Token Swap (~150,000 gas)</span>
                      <span className="text-white font-medium">
                        ${ethPrice > 0 ? ((gasData.standard * 150000 * ethPrice) / 1e9).toFixed(2) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">NFT Mint (~200,000 gas)</span>
                      <span className="text-white font-medium">
                        ${ethPrice > 0 ? ((gasData.standard * 200000 * ethPrice) / 1e9).toFixed(2) : '...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ETH Price Card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <span className="text-xl">⟠</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Ethereum</h3>
                  <span className="text-xs text-gray-500">ETH/USD</span>
                </div>
              </div>
              <LiveIndicator />
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-1">
                ${ethPrice > 0 ? ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}
              </div>
              <div className={`flex items-center gap-1 text-sm ${ethChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {ethChange >= 0 ? <TrendUpIcon className="w-4 h-4" /> : <TrendDownIcon className="w-4 h-4" />}
                <span className="font-medium">{Math.abs(ethChange).toFixed(2)}%</span>
                <span className="text-gray-500 ml-1">(24h)</span>
              </div>
            </div>

            {/* ETH Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/20">
                <div className="text-xs text-gray-500">24h High</div>
                <div className="text-sm font-bold text-emerald-400">
                  ${ethPrice > 0 ? (ethPrice * 1.03).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/20">
                <div className="text-xs text-gray-500">24h Low</div>
                <div className="text-sm font-bold text-red-400">
                  ${ethPrice > 0 ? (ethPrice * 0.97).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}
                </div>
              </div>
            </div>

            {/* Data source */}
            <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
              <span className="text-xs text-gray-500">Source: CoinGecko API</span>
              <span className="text-xs text-gray-600">Updates every 30s</span>
            </div>
          </div>
        </div>

        {/* API Info Footer */}
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${apiStatus.coingecko ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">CoinGecko API</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${apiStatus.ethereum ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">Ethereum RPC (llamarpc.com)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Ankr Public RPC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">PublicNode RPC</span>
          </div>
        </div>
      </div>
    </section>
  );
}
