import { useState, useEffect } from 'react';

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
            <a href="#tokenomics" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Tokenomics</a>
            <a href="#roadmap" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Roadmap</a>
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
            <a href="#features" className="block text-sm text-gray-400 hover:text-emerald-400 py-2">Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-emerald-400 py-2">How It Works</a>
            <a href="#tokenomics" className="block text-sm text-gray-400 hover:text-emerald-400 py-2">Tokenomics</a>
            <a href="#roadmap" className="block text-sm text-gray-400 hover:text-emerald-400 py-2">Roadmap</a>
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
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-bg overflow-hidden">
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm text-emerald-400">Live on Ethereum Mainnet</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Decarbonize the</span>
          <br />
          <span className="gradient-text">Future with Blockchain</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          The first decentralized protocol for transparent, verifiable carbon credit trading. 
          Tokenize carbon offsets, eliminate greenwashing, and accelerate global climate action.
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

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: '$2.4M+', label: 'Carbon Credits Traded' },
            { value: '150K+', label: 'Tonnes CO₂ Offset' },
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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

// CTA Section
function CTA() {
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
              Join thousands of individuals and organizations using blockchain to fight climate change. 
              Every transaction creates a verifiable, permanent record of positive environmental action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Launch App
                <ArrowRightIcon />
              </button>
              <button className="btn-secondary px-8 py-4 rounded-xl text-emerald-400 font-semibold w-full sm:w-auto">
                Join Discord
              </button>
            </div>
          </div>
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
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Protocol</h4>
            <ul className="space-y-2">
              {['Trade Credits', 'Retire Credits', 'Verify Projects', 'Analytics'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'Whitepaper', 'GitHub', 'Bug Bounty'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2">
              {['Twitter', 'Discord', 'Telegram', 'Blog'].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 CO2Chain. All rights reserved.</p>
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
      <Hero />
      <Partners />
      <Features />
      <HowItWorks />
      <Tokenomics />
      <Roadmap />
      <CTA />
      <Footer />
    </div>
  );
}
