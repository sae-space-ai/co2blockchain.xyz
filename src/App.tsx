import { useState, useEffect, useRef } from 'react';
import {
  useEthereumData,
  useCryptoPrices,
  useGasTracker,
  useGlobalMarket,
  useEthPrice,
  formatNumber,
} from './hooks/useRealTimeData';

// ============================================
// SVG ICONS
// ============================================
function LeafIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function ChainIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function GlobeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function WalletIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function ChartIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function MenuIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

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

function ZapIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CodeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ActivityIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// ============================================
// MINI SPARKLINE CHART
// ============================================
function Sparkline({ data, color = "#10b981", width = 100, height = 30 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// LIVE PRICE TICKER (Real CoinGecko Data)
// ============================================
function PriceTicker() {
  const { prices, loading } = useCryptoPrices(['ethereum', 'matic-network', 'chainlink', 'the-graph', 'uniswap']);

  if (loading || prices.length === 0) {
    return (
      <div className="fixed top-16 sm:top-20 left-0 right-0 z-40 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-emerald-500/5 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500">Connecting to CoinGecko API...</span>
        </div>
      </div>
    );
  }

  const displayItems = [...prices, ...prices]; // Duplicate for seamless scroll

  return (
    <div className="fixed top-16 sm:top-20 left-0 right-0 z-40 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-emerald-500/5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {displayItems.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 text-xs">
            <span className="text-white font-medium">{item.symbol}</span>
            <span className="text-gray-300">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            <span className={`flex items-center gap-0.5 ${item.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change24h >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(item.change24h).toFixed(2)}%
            </span>
            <span className="text-gray-600">Vol: {formatNumber(item.volume24h)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// NAVIGATION
// ============================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ethData = useEthereumData();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-emerald-500/10' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <LeafIcon className="w-5 h-5 text-[#0a0f0d]" />
            </div>
            <span className="text-lg font-bold text-white">CO2<span className="text-emerald-400">Chain</span></span>
            {ethData.blockNumber > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono">#{ethData.blockNumber.toLocaleString()}</span>
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#live-data" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Live Data</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#tokenomics" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Tokenomics</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="btn-secondary px-4 py-2 rounded-lg text-sm text-emerald-400">Connect Wallet</button>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm text-white font-medium">Launch App</button>
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0a0f0d]/95 backdrop-blur-xl border-b border-emerald-500/10">
          <div className="px-4 py-4 space-y-3">
            <a href="#live-data" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Live Data</a>
            <a href="#features" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#tokenomics" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Tokenomics</a>
            <a href="#faq" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>FAQ</a>
            <div className="pt-3 flex gap-3">
              <button className="btn-secondary px-4 py-2 rounded-lg text-sm text-emerald-400 flex-1">Connect Wallet</button>
              <button className="btn-primary px-4 py-2 rounded-lg text-sm text-white font-medium flex-1">Launch App</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ============================================
// HERO with REAL Ethereum Data
// ============================================
function Hero() {
  const ethData = useEthereumData();
  const gasData = useGasTracker();
  const { price: ethPrice, change: ethChange } = useEthPrice();
  const globalMarket = useGlobalMarket();

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-bg overflow-hidden pt-32">
      {/* Background effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float-delay" />
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[600px] h-[600px] border border-emerald-500/20 rounded-full animate-spin-slow" />
        <div className="absolute w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-emerald-400">
              {ethData.loading ? 'Connecting to Ethereum...' : `Ethereum Mainnet • Block #${ethData.blockNumber.toLocaleString()}`}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Decarbonize</span>
            <br />
            <span className="gradient-text">With Blockchain</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The first decentralized protocol for transparent, verifiable carbon credit trading. 
            Powered by real-time Ethereum blockchain data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
              Start Trading Carbon Credits
              <ArrowRightIcon />
            </button>
            <button className="btn-secondary px-8 py-4 rounded-xl text-emerald-400 font-semibold w-full sm:w-auto">
              Read Whitepaper
            </button>
          </div>
        </div>

        {/* REAL-TIME DATA DASHBOARD */}
        <div id="live-data" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {/* ETH Price */}
          <div className="stat-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">ETH Price</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white">
              {ethPrice > 0 ? `$${ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '...'}
            </div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${ethChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ethChange >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(ethChange).toFixed(2)}% (24h)
            </div>
          </div>

          {/* Gas Price */}
          <div className="stat-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Gas Price</span>
              <ZapIcon className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="text-xl font-bold text-white">
              {gasData.loading ? '...' : `${gasData.standard} Gwei`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {gasData.loading ? 'Loading...' : gasData.estimatedTime.standard}
            </div>
          </div>

          {/* Block Number */}
          <div className="stat-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Latest Block</span>
              <ChainIcon className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {ethData.loading ? '...' : `#${ethData.blockNumber.toLocaleString()}`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {ethData.transactions} transactions
            </div>
          </div>

          {/* Global Market Cap */}
          <div className="stat-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Crypto Market Cap</span>
              <ChartIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">
              {globalMarket.data ? formatNumber(globalMarket.data.totalMarketCap) : '...'}
            </div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${globalMarket.data && globalMarket.data.marketCapChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {globalMarket.data && globalMarket.data.marketCapChange24h >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {globalMarket.data ? `${Math.abs(globalMarket.data.marketCapChange24h).toFixed(2)}%` : '...'}
            </div>
          </div>
        </div>

        {/* Gas Tiers */}
        {!gasData.loading && (
          <div className="max-w-5xl mx-auto mt-4 grid grid-cols-3 gap-3">
            <div className="bg-black/20 rounded-lg p-3 text-center border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1">🐢 Slow</div>
              <div className="text-sm font-bold text-white">{gasData.slow} Gwei</div>
              <div className="text-xs text-gray-600">{gasData.estimatedTime.slow}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center border border-emerald-500/20">
              <div className="text-xs text-emerald-400 mb-1">⚡ Standard</div>
              <div className="text-sm font-bold text-white">{gasData.standard} Gwei</div>
              <div className="text-xs text-gray-600">{gasData.estimatedTime.standard}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1">🚀 Fast</div>
              <div className="text-sm font-bold text-white">{gasData.fast} Gwei</div>
              <div className="text-xs text-gray-600">{gasData.estimatedTime.fast}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// LIVE MARKET DATA SECTION (Real CoinGecko)
// ============================================
function LiveMarketSection() {
  const { prices, loading, error, lastUpdate } = useCryptoPrices([
    'ethereum', 'matic-network', 'chainlink', 'the-graph', 'uniswap', 'aave'
  ]);
  const globalMarket = useGlobalMarket();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Live Market Data</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Real-Time <span className="gradient-text">Crypto Markets</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Live data from CoinGecko API. Prices update every 60 seconds.
          </p>
          {lastUpdate && (
            <p className="text-xs text-gray-600 mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()} • Source: CoinGecko API
            </p>
          )}
        </div>

        {/* Global Stats */}
        {globalMarket.data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Total Market Cap</div>
              <div className="text-lg font-bold text-white">{formatNumber(globalMarket.data.totalMarketCap)}</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">24h Volume</div>
              <div className="text-lg font-bold text-white">{formatNumber(globalMarket.data.totalVolume)}</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">BTC Dominance</div>
              <div className="text-lg font-bold text-white">{globalMarket.data.btcDominance.toFixed(1)}%</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">ETH Dominance</div>
              <div className="text-lg font-bold text-emerald-400">{globalMarket.data.ethDominance.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Crypto Price Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/10">
                  <th className="text-left text-xs text-gray-500 font-medium p-4">#</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Asset</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4">Price</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4">24h %</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4 hidden sm:table-cell">Market Cap</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4 hidden md:table-cell">Volume (24h)</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4 hidden lg:table-cell">7d Chart</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-500">Fetching live data from CoinGecko...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <span className="text-sm text-red-400">Error: {error}</span>
                    </td>
                  </tr>
                )}
                {prices.map((coin, i) => (
                  <tr key={coin.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                    <td className="p-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="p-4">
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
                    <td className="p-4 text-right text-sm font-medium text-white">
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className={`p-4 text-right text-sm font-medium ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {coin.change24h >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                        {Math.abs(coin.change24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400 hidden sm:table-cell">
                      {formatNumber(coin.marketCap)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400 hidden md:table-cell">
                      {formatNumber(coin.volume24h)}
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">
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
      </div>
    </section>
  );
}

// ============================================
// LIVE ETHEREUM NETWORK STATUS
// ============================================
function NetworkStatus() {
  const ethData = useEthereumData();
  const gasData = useGasTracker();
  const { price: ethPrice } = useEthPrice();
  const [blockHistory, setBlockHistory] = useState<number[]>([]);

  useEffect(() => {
    if (ethData.blockNumber > 0) {
      setBlockHistory(prev => {
        const next = [...prev, ethData.blockNumber].slice(-20);
        return next;
      });
    }
  }, [ethData.blockNumber]);

  const txCostUsd = ethPrice > 0 ? (gasData.standard * 21000 * ethPrice) / 1e9 : 0;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Network Status</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Ethereum <span className="gradient-text">On-Chain</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Real-time data directly from Ethereum mainnet via public RPC nodes. Updates every 12 seconds.
          </p>
          {ethData.lastUpdate && (
            <p className="text-xs text-gray-600 mt-2">
              Last sync: {ethData.lastUpdate.toLocaleTimeString()} • RPC: eth.llamarpc.com
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Info */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Network Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Block Number</span>
                <span className="text-sm font-mono text-white">{ethData.loading ? '...' : `#${ethData.blockNumber.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transactions</span>
                <span className="text-sm text-white">{ethData.loading ? '...' : ethData.transactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Connected Peers</span>
                <span className="text-sm text-white">{ethData.loading ? '...' : ethData.peerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Base Fee</span>
                <span className="text-sm text-white">{ethData.loading ? '...' : `${ethData.baseFee} Gwei`}</span>
              </div>
            </div>
          </div>

          {/* Gas Tracker */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ZapIcon className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Gas Tracker</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">🐢 Slow</span>
                <span className="text-sm font-mono text-white">{gasData.loading ? '...' : `${gasData.slow} Gwei`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">⚡ Standard</span>
                <span className="text-sm font-mono text-emerald-400">{gasData.loading ? '...' : `${gasData.standard} Gwei`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">🚀 Fast</span>
                <span className="text-sm font-mono text-white">{gasData.loading ? '...' : `${gasData.fast} Gwei`}</span>
              </div>
              <div className="border-t border-emerald-500/10 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ETH Transfer Cost</span>
                  <span className="text-sm text-white">${txCostUsd.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Block Production */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChainIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Block Production</h3>
            </div>
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2">Recent Blocks (live)</div>
              <div className="flex items-end gap-0.5 h-12">
                {blockHistory.map((block, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 rounded-sm transition-all duration-300"
                    style={{ height: `${40 + Math.random() * 60}%` }}
                    title={`Block #${block.toLocaleString()}`}
                  />
                ))}
                {blockHistory.length === 0 && Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-800 rounded-sm h-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Block Time</span>
                <span className="text-xs text-white">~12 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Consensus</span>
                <span className="text-xs text-white">Proof of Stake</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {ethData.error ? 'Error' : 'Healthy'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 glass-card rounded-xl p-4 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${ethData.error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-xs text-gray-400">Ethereum RPC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">CoinGecko API</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Public Nodes</span>
          </div>
          <span className="text-xs text-gray-600">All systems operational • Data refreshes automatically</span>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================
function Features() {
  const features = [
    { icon: <ShieldIcon className="w-7 h-7" />, title: 'Immutable Verification', description: 'Every carbon credit is verified on-chain with cryptographic proof. No double-counting, no fraud.' },
    { icon: <GlobeIcon className="w-7 h-7" />, title: 'Global Marketplace', description: 'Access carbon credits from verified projects worldwide. Connect buyers and sellers seamlessly.' },
    { icon: <ChainIcon className="w-7 h-7" />, title: 'Smart Contract Automation', description: 'Automated escrow, settlement, and retirement of credits through audited smart contracts.' },
    { icon: <ChartIcon className="w-7 h-7" />, title: 'Real-Time Analytics', description: 'Track your carbon footprint and portfolio performance with live blockchain data.' },
    { icon: <WalletIcon className="w-7 h-7" />, title: 'Multi-Chain Support', description: 'Trade across Ethereum, Polygon, and more. Low fees, fast settlements.' },
    { icon: <LeafIcon className="w-7 h-7" />, title: 'Verified Projects', description: 'Only Verra, Gold Standard, and CAR certified projects. Rigorous third-party auditing.' },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Built for the <span className="gradient-text">Climate Economy</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Combining blockchain transparency with environmental integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
function HowItWorks() {
  const steps = [
    { step: '01', title: 'Verify & Tokenize', description: 'Carbon offset projects are verified by certified auditors. Credits are minted as NFTs on Ethereum with full metadata.', icon: <ShieldIcon className="w-8 h-8" /> },
    { step: '02', title: 'List & Trade', description: 'List your tokenized credits on our decentralized marketplace. Set prices, create auctions, or use our AMM.', icon: <ChartIcon className="w-8 h-8" /> },
    { step: '03', title: 'Retire & Impact', description: 'Retire credits to offset emissions. Each retirement is permanently recorded on-chain as immutable proof of climate action.', icon: <LeafIcon className="w-8 h-8" /> },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Process</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                {step.icon}
              </div>
              <div className="text-emerald-400/50 text-sm font-mono mb-2">{step.step}</div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TOKENOMICS
// ============================================
function Tokenomics() {
  return (
    <section id="tokenomics" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Tokenomics</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            $CO2 <span className="gradient-text">Token</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Token Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Community & Ecosystem', pct: 35, color: 'bg-emerald-500' },
                { label: 'Staking Rewards', pct: 25, color: 'bg-cyan-500' },
                { label: 'Team & Advisors', pct: 15, color: 'bg-emerald-400' },
                { label: 'Treasury', pct: 15, color: 'bg-teal-500' },
                { label: 'Liquidity', pct: 10, color: 'bg-emerald-600' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-emerald-400 font-medium">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Token Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Supply', value: '1,000,000,000' },
                  { label: 'Network', value: 'Ethereum' },
                  { label: 'Standard', value: 'ERC-20' },
                  { label: 'Staking APY', value: 'Up to 18%' },
                ].map((item, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Utility</h3>
              <ul className="space-y-3">
                {['Governance voting on protocol parameters', 'Discounted trading fees (up to 50% off)', 'Staking for $CO2 rewards', 'Project verification bonding', 'Access to premium analytics'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FAQ
// ============================================
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'Where does the live data come from?', a: 'All market data is fetched in real-time from the CoinGecko API (free tier). Blockchain data (block numbers, gas prices, transactions) comes directly from Ethereum mainnet via public RPC endpoints like eth.llamarpc.com and rpc.ankr.com. No API keys are required.' },
    { q: 'How often does the data update?', a: 'Ethereum blockchain data updates every ~12 seconds (matching block time). CoinGecko price data refreshes every 60 seconds (free tier rate limit). Gas prices update every 15 seconds. All updates happen automatically in the background.' },
    { q: 'What are carbon credits and how does blockchain help?', a: 'Carbon credits represent one metric ton of CO₂ reduced or removed from the atmosphere. Blockchain ensures every credit is unique, verifiable, and cannot be double-counted. Each credit is tokenized as an NFT with full provenance data.' },
    { q: 'Which carbon standards are supported?', a: 'We support credits verified under Verra (VCS), Gold Standard, and Climate Action Reserve (CAR). All projects undergo rigorous third-party auditing.' },
    { q: 'What are the transaction fees?', a: 'CO2Chain charges a 1% trading fee. Holding $CO2 tokens provides discounts of up to 50%. Gas fees depend on the network — visible in real-time on our dashboard above.' },
    { q: 'Is CO2Chain audited?', a: 'Yes. Our smart contracts have been audited by Trail of Bits and OpenZeppelin. We maintain a bug bounty program with rewards up to $100,000 for critical vulnerabilities.' },
  ];

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">FAQ</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Common <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="text-sm sm:text-base font-medium text-white pr-4">{faq.q}</span>
                <ChevronDownIcon className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA + Newsletter
// ============================================
function CTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Make an <span className="gradient-text">Impact</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Join thousands using blockchain to fight climate change.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Launch App <ArrowRightIcon />
              </button>
              <button className="btn-secondary px-8 py-4 rounded-xl text-emerald-400 font-semibold w-full sm:w-auto">
                Join Discord
              </button>
            </div>

            <div className="border-t border-emerald-500/10 pt-8 mt-4">
              <p className="text-sm text-gray-500 mb-4">Stay updated with protocol developments</p>
              {subscribed ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-sm text-emerald-400">You're subscribed! Welcome to the movement.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors" required />
                  <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-white text-sm font-medium whitespace-nowrap">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="border-t border-emerald-500/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <LeafIcon className="w-5 h-5 text-[#0a0f0d]" />
              </div>
              <span className="text-lg font-bold text-white">CO2<span className="text-emerald-400">Chain</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Decentralized carbon credit marketplace. Transparent. Verifiable. Impactful.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Protocol</h4>
            <ul className="space-y-2">
              {['Trade Credits', 'Retire Credits', 'Verify Projects', 'Analytics', 'API Docs'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'Whitepaper', 'GitHub', 'Bug Bounty', 'Brand Kit'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Data Sources</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-500">CoinGecko API</span></li>
              <li><span className="text-sm text-gray-500">Ethereum RPC</span></li>
              <li><span className="text-sm text-gray-500">LlamaRPC Nodes</span></li>
              <li><span className="text-sm text-gray-500">Ankr Public RPC</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 CO2Chain Protocol. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-gray-200 overflow-x-hidden">
      <Navbar />
      <PriceTicker />
      <Hero />
      <LiveMarketSection />
      <NetworkStatus />
      <Features />
      <HowItWorks />
      <Tokenomics />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
