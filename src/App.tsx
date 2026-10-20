import { useState, useEffect, useRef } from 'react';

// Icons as components
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

function ExternalLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
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

function UsersIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

// Live Price Ticker
function PriceTicker() {
  const [prices, setPrices] = useState([
    { name: '$CO2', price: 0.42, change: 5.3, volume: '2.1M' },
    { name: 'VCS Credits', price: 18.50, change: 2.1, volume: '890K' },
    { name: 'Gold Std', price: 24.30, change: -1.2, volume: '450K' },
    { name: 'CAR', price: 21.80, change: 3.7, volume: '320K' },
    { name: 'REDD+', price: 15.60, change: 8.4, volume: '180K' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: +(p.price * (1 + (Math.random() - 0.48) * 0.005)).toFixed(2),
        change: +(p.change + (Math.random() - 0.5) * 0.3).toFixed(1),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-16 sm:top-20 left-0 right-0 z-40 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-emerald-500/5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...prices, ...prices].map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 text-xs">
            <span className="text-white font-medium">{item.name}</span>
            <span className="text-gray-300">${item.price}</span>
            <span className={`flex items-center gap-0.5 ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(item.change)}%
            </span>
            <span className="text-gray-600">Vol: {item.volume}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Navigation
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#dashboard" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Dashboard</a>
            <a href="#tokenomics" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Tokenomics</a>
            <a href="#ecosystem" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Ecosystem</a>
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
            <a href="#features" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#dashboard" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Dashboard</a>
            <a href="#tokenomics" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Tokenomics</a>
            <a href="#ecosystem" className="block text-sm text-gray-400 hover:text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>Ecosystem</a>
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

// Hero Section
function Hero() {
  const [co2Count, setCo2Count] = useState(152847);

  useEffect(() => {
    const interval = setInterval(() => {
      setCo2Count(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-bg overflow-hidden pt-28">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float-delay" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
      <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-slow" />
      <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-emerald-300 rounded-full animate-pulse-slow" />

      {/* Blockchain visual */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[600px] h-[600px] border border-emerald-500/20 rounded-full animate-spin-slow" />
        <div className="absolute w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
        <div className="absolute w-[200px] h-[200px] border border-emerald-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-emerald-400">Live on Ethereum Mainnet</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Decarbonize</span>
              <br />
              <span className="gradient-text">With Blockchain</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              The first decentralized protocol for transparent, verifiable carbon credit trading. 
              Tokenize offsets, eliminate greenwashing, and accelerate climate action.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center lg:justify-start">
              <button className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Start Trading
                <ArrowRightIcon />
              </button>
              <button className="btn-secondary px-8 py-4 rounded-xl text-emerald-400 font-semibold w-full sm:w-auto">
                Read Whitepaper
              </button>
            </div>

            {/* Live counter */}
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">CO₂ Offset Today:</span>
                <span className="text-sm font-mono text-emerald-400 font-bold">{co2Count.toLocaleString()} tonnes</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
          {[
            { value: '$2.4M+', label: 'Carbon Credits Traded' },
            { value: '152K+', label: 'Tonnes CO₂ Offset' },
            { value: '12,000+', label: 'Active Users' },
            { value: '45+', label: 'Partner Projects' },
          ].map((stat, i) => (
            <div key={i} className="stat-card rounded-xl p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Dashboard Mockup
function DashboardMockup() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Portfolio', 'Market', 'Impact'];

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
      <div className="relative glass-card rounded-2xl p-5 border border-emerald-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ChartIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">CO2Chain Dashboard</div>
              <div className="text-xs text-gray-500">0x7a3...f92d</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-black/30 rounded-lg p-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 text-xs py-2 rounded-md transition-all ${activeTab === i ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on tab */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Total Portfolio Value</div>
              <div className="text-2xl font-bold text-white">$48,392.50</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendUpIcon className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">+12.4% (30d)</span>
              </div>
            </div>
            {/* Mini chart */}
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-3">Credit Holdings</div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/60 to-cyan-500/60 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            {/* Holdings */}
            <div className="space-y-2">
              {[
                { name: 'VCS Tropical Forest', amount: '2,450', value: '$45,325' },
                { name: 'Gold Std Solar', amount: '180', value: '$4,374' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-white">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.amount} credits</div>
                  </div>
                  <div className="text-xs font-medium text-emerald-400">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-3">
            {[
              { name: 'VCS Amazon Basin', price: '$18.50', change: '+2.1%', type: 'buy' },
              { name: 'Gold Std Wind Power', price: '$24.30', change: '-1.2%', type: 'sell' },
              { name: 'CAR Reforestation', price: '$21.80', change: '+3.7%', type: 'buy' },
              { name: 'REDD+ Mangrove', price: '$15.60', change: '+8.4%', type: 'buy' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'buy' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <LeafIcon className={`w-4 h-4 ${item.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="text-xs text-white">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.price}</div>
                  </div>
                </div>
                <span className={`text-xs font-medium ${item.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-2">Your Total Impact</div>
              <div className="text-3xl font-bold gradient-text">847 tonnes</div>
              <div className="text-xs text-gray-500 mt-1">CO₂ equivalent offset</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">23</div>
                <div className="text-xs text-gray-500">Trees Equivalent</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">4.2</div>
                <div className="text-xs text-gray-500">Cars Off Road</div>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-2">Impact Over Time</div>
              <div className="flex items-end gap-0.5 h-12">
                {[20, 35, 50, 40, 65, 80, 70, 90, 85, 95, 88, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Live Activity Feed
function LiveActivity() {
  const [transactions, setTransactions] = useState([
    { type: 'retire', user: '0x7a3...f92d', amount: '50 tonnes', project: 'Amazon Basin REDD+', time: '2s ago', hash: '0x8f3a...c2d1' },
    { type: 'trade', user: '0xb12...e45a', amount: '200 credits', project: 'Gold Std Solar India', time: '15s ago', hash: '0x3d7b...a9f4' },
    { type: 'mint', user: '0x9c4...d81f', amount: '1,000 credits', project: 'CAR Reforestation Brazil', time: '32s ago', hash: '0x1e5c...b7e2' },
    { type: 'retire', user: '0x2f8...a63c', amount: '25 tonnes', project: 'VCS Wind Power Kenya', time: '1m ago', hash: '0x6a9d...e3c8' },
    { type: 'trade', user: '0xd56...b29e', amount: '500 credits', project: 'Mangrove Restoration', time: '2m ago', hash: '0x4b2f...d1a7' },
  ]);

  useEffect(() => {
    const newTxTypes = ['retire', 'trade', 'mint'];
    const projects = ['Amazon Basin REDD+', 'Gold Std Solar India', 'CAR Reforestation', 'VCS Wind Power', 'Mangrove Restoration', 'Biomass Energy Nepal'];
    const interval = setInterval(() => {
      const newTx = {
        type: newTxTypes[Math.floor(Math.random() * newTxTypes.length)],
        user: `0x${Math.random().toString(16).slice(2, 5)}...${Math.random().toString(16).slice(2, 6)}`,
        amount: `${Math.floor(Math.random() * 500 + 10)} ${Math.random() > 0.5 ? 'tonnes' : 'credits'}`,
        project: projects[Math.floor(Math.random() * projects.length)],
        time: 'just now',
        hash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      };
      setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retire': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'trade': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'mint': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <section id="dashboard" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Live Activity</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Real-Time <span className="gradient-text">On-Chain</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Every transaction is permanently recorded on the blockchain. Watch the climate economy in action.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium">Recent Transactions</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">Block #18,294,571</span>
            </div>
            <div className="divide-y divide-emerald-500/5">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-emerald-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getTypeColor(tx.type)}`}>
                      {tx.type.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm text-white">{tx.amount}</div>
                      <div className="text-xs text-gray-500">{tx.project}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-mono">{tx.user}</div>
                    <div className="text-xs text-gray-600">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function Features() {
  const features = [
    {
      icon: <ShieldIcon className="w-7 h-7" />,
      title: 'Immutable Verification',
      description: 'Every carbon credit is verified on-chain with cryptographic proof. No double-counting, no fraud, complete transparency.'
    },
    {
      icon: <GlobeIcon className="w-7 h-7" />,
      title: 'Global Marketplace',
      description: 'Access carbon credits from verified projects worldwide. Connect buyers and sellers across borders seamlessly.'
    },
    {
      icon: <ChainIcon className="w-7 h-7" />,
      title: 'Smart Contract Automation',
      description: 'Automated escrow, settlement, and retirement of credits through audited smart contracts. Trust the code.'
    },
    {
      icon: <ChartIcon className="w-7 h-7" />,
      title: 'Real-Time Analytics',
      description: 'Track your carbon footprint, portfolio performance, and environmental impact with our comprehensive dashboard.'
    },
    {
      icon: <WalletIcon className="w-7 h-7" />,
      title: 'Multi-Chain Support',
      description: 'Trade across Ethereum, Polygon, and more. Low fees, fast settlements, and maximum flexibility.'
    },
    {
      icon: <LeafIcon className="w-7 h-7" />,
      title: 'Verified Projects',
      description: 'Only Verra, Gold Standard, and Climate Action Reserve certified projects. Rigorous third-party auditing.'
    },
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
            Combining blockchain transparency with environmental integrity to create a trustworthy carbon market.
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

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Verify & Tokenize',
      description: 'Carbon offset projects are verified by certified auditors. Credits are then minted as NFTs on the blockchain with full metadata.',
      icon: <ShieldIcon className="w-8 h-8" />
    },
    {
      step: '02',
      title: 'List & Trade',
      description: 'List your tokenized credits on our decentralized marketplace. Set prices, create auctions, or use our automated market maker.',
      icon: <ChartIcon className="w-8 h-8" />
    },
    {
      step: '03',
      title: 'Retire & Impact',
      description: 'Retire credits to offset your emissions. Each retirement is permanently recorded on-chain, creating an immutable record of your climate action.',
      icon: <LeafIcon className="w-8 h-8" />
    },
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
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            From verification to retirement — a transparent journey for every carbon credit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px chain-link z-0" style={{ width: 'calc(100% - 3rem)' }} />
              )}
              <div className="glass-card rounded-2xl p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                  {step.icon}
                </div>
                <div className="text-emerald-400/50 text-sm font-mono mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Tokenomics Section
function Tokenomics() {
  return (
    <section id="tokenomics" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Tokenomics</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            $CO2 <span className="gradient-text">Token</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            The native utility token powering the CO2Chain ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Token Info */}
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
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Token Stats */}
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
                {[
                  'Governance voting on protocol parameters',
                  'Discounted trading fees (up to 50% off)',
                  'Staking for $CO2 rewards',
                  'Project verification bonding',
                  'Access to premium analytics',
                ].map((item, i) => (
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

// Ecosystem Section
function Ecosystem() {
  const integrations = [
    { name: 'Ethereum', desc: 'Primary L1 network', icon: <ChainIcon className="w-6 h-6" />, status: 'active' },
    { name: 'Polygon', desc: 'Low-cost L2 scaling', icon: <ZapIcon className="w-6 h-6" />, status: 'active' },
    { name: 'Chainlink', desc: 'Oracle price feeds', icon: <ChainIcon className="w-6 h-6" />, status: 'active' },
    { name: 'The Graph', desc: 'Indexing & queries', icon: <CodeIcon className="w-6 h-6" />, status: 'active' },
    { name: 'IPFS', desc: 'Decentralized storage', icon: <GlobeIcon className="w-6 h-6" />, status: 'active' },
    { name: 'Arbitrum', desc: 'Coming soon', icon: <ZapIcon className="w-6 h-6" />, status: 'coming' },
  ];

  return (
    <section id="ecosystem" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Ecosystem</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Powered by <span className="gradient-text">Web3</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Built on the most robust blockchain infrastructure for maximum security and scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  {item.icon}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                  {item.status === 'active' ? '● Live' : '◐ Coming Soon'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Roadmap Section
function Roadmap() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Foundation',
      period: 'Q1 2025',
      status: 'completed',
      items: ['Smart contract development', 'Security audit by Trail of Bits', 'Testnet launch', 'Team expansion']
    },
    {
      phase: 'Phase 2',
      title: 'Launch',
      period: 'Q2 2025',
      status: 'completed',
      items: ['Mainnet deployment', 'First carbon credit tokenization', 'Marketplace launch', '$CO2 token generation']
    },
    {
      phase: 'Phase 3',
      title: 'Growth',
      period: 'Q3-Q4 2025',
      status: 'active',
      items: ['Cross-chain bridge (Polygon)', 'Mobile app beta', 'Enterprise API', '100+ verified projects']
    },
    {
      phase: 'Phase 4',
      title: 'Scale',
      period: '2026',
      status: 'upcoming',
      items: ['DAO governance launch', 'Carbon DeFi integrations', 'Institutional partnerships', 'Global expansion']
    },
  ];

  return (
    <section id="roadmap" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Roadmap</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Building the <span className="gradient-text">Future</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our journey to creating the most transparent carbon market in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, i) => (
            <div key={i} className={`glass-card rounded-2xl p-6 transition-all duration-300 ${phase.status === 'active' ? 'border-emerald-500/40 glow-green' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${phase.status === 'completed' ? 'bg-emerald-400' : phase.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-xs font-mono text-gray-500">{phase.phase}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{phase.title}</h3>
              <p className="text-xs text-emerald-400 mb-4">{phase.period}</p>
              <ul className="space-y-2">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${phase.status === 'completed' ? 'bg-emerald-400' : phase.status === 'active' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What are carbon credits and how does blockchain help?',
      a: 'Carbon credits represent one metric ton of CO₂ that has been reduced or removed from the atmosphere. Blockchain ensures every credit is unique, verifiable, and cannot be double-counted. Each credit is tokenized as an NFT with full provenance data including the project, verification body, and retirement history.'
    },
    {
      q: 'How do I buy carbon credits on CO2Chain?',
      a: 'Connect your Web3 wallet (MetaMask, WalletConnect, etc.), browse available credits from verified projects, and purchase directly using ETH, USDC, or our native $CO2 token. Credits are delivered to your wallet instantly and can be held, traded, or retired.'
    },
    {
      q: 'What does "retiring" a carbon credit mean?',
      a: 'Retiring a credit means permanently removing it from circulation to offset your emissions. Once retired, the credit cannot be traded again. A permanent, on-chain record is created proving your contribution to climate action — this is your immutable proof of impact.'
    },
    {
      q: 'Which carbon standards are supported?',
      a: 'We currently support credits verified under Verra (VCS), Gold Standard, and Climate Action Reserve (CAR). All projects undergo rigorous third-party auditing. We are actively working to add American Carbon Registry and Plan Vivo certifications.'
    },
    {
      q: 'What are the transaction fees?',
      a: 'CO2Chain charges a 1% trading fee. Holding $CO2 tokens provides discounts of up to 50%. Gas fees depend on the network — Ethereum mainnet for maximum security, or Polygon for low-cost transactions. Stakers receive additional fee rebates.'
    },
    {
      q: 'Is CO2Chain audited?',
      a: 'Yes. Our smart contracts have been audited by Trail of Bits and OpenZeppelin. All audit reports are publicly available. We also maintain a bug bounty program with rewards up to $100,000 for critical vulnerabilities.'
    },
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
          <p className="text-gray-400 text-lg">
            Everything you need to know about CO2Chain and carbon credit trading.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
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

// CTA + Newsletter Section
function CTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
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
              Every transaction creates a verifiable, permanent record of positive environmental action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Launch App
                <ArrowRightIcon />
              </button>
              <button className="btn-secondary px-8 py-4 rounded-xl text-emerald-400 font-semibold w-full sm:w-auto">
                Join Discord
              </button>
            </div>

            {/* Newsletter */}
            <div className="border-t border-emerald-500/10 pt-8 mt-4">
              <p className="text-sm text-gray-500 mb-4">Stay updated with protocol developments</p>
              {subscribed ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-sm text-emerald-400">You're subscribed! Welcome to the movement.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    required
                  />
                  <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-white text-sm font-medium whitespace-nowrap">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Partners Section
function Partners() {
  const partners = [
    'Verra', 'Gold Standard', 'Climate Action Reserve', 'Ethereum Foundation',
    'Polygon', 'Chainlink', 'The Graph', 'IPFS'
  ];

  return (
    <section className="py-16 border-t border-b border-emerald-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 mb-8">Trusted by leading organizations in carbon markets & blockchain</p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {partners.map((partner, i) => (
            <div key={i} className="text-gray-600 hover:text-emerald-400 transition-colors text-sm sm:text-base font-medium">
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
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
            <h4 className="text-sm font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2">
              {['Twitter / X', 'Discord', 'Telegram', 'Blog', 'Forum'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 CO2Chain Protocol. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App
export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-gray-200 overflow-x-hidden">
      <Navbar />
      <PriceTicker />
      <Hero />
      <Partners />
      <Features />
      <HowItWorks />
      <LiveActivity />
      <Tokenomics />
      <Ecosystem />
      <Roadmap />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
