import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { useEthPrice, useCryptoPrices } from '../hooks/useRealTimeData';
import { ConnectWallet } from '../components/ConnectWallet';

// Icons
function LeafIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function HomeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function WalletIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function HistoryIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function FireIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
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

function TrendUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

// Carbon Credit Types
interface CarbonCredit {
  id: string;
  name: string;
  standard: 'VCS' | 'GS' | 'CAR';
  type: string;
  price: number;
  available: number;
  country: string;
  vintage: number;
  verified: boolean;
  image: string;
}

// Mock Carbon Credits Data
const CARBON_CREDITS: CarbonCredit[] = [
  { id: '1', name: 'Amazon Basin REDD+', standard: 'VCS', type: 'Forest Conservation', price: 18.50, available: 2450, country: 'Brazil', vintage: 2024, verified: true, image: '🌳' },
  { id: '2', name: 'Gold Standard Solar India', standard: 'GS', type: 'Renewable Energy', price: 24.30, available: 1200, country: 'India', vintage: 2024, verified: true, image: '☀️' },
  { id: '3', name: 'CAR Reforestation', standard: 'CAR', type: 'Reforestation', price: 21.80, available: 890, country: 'USA', vintage: 2023, verified: true, image: '🌲' },
  { id: '4', name: 'Mangrove Restoration', standard: 'VCS', type: 'Blue Carbon', price: 15.60, available: 3100, country: 'Indonesia', vintage: 2024, verified: true, image: '🌊' },
  { id: '5', name: 'Wind Power Kenya', standard: 'GS', type: 'Renewable Energy', price: 19.20, available: 1750, country: 'Kenya', vintage: 2024, verified: true, image: '💨' },
  { id: '6', name: 'Biomass Energy Nepal', standard: 'VCS', type: 'Renewable Energy', price: 12.40, available: 4200, country: 'Nepal', vintage: 2023, verified: true, image: '🔥' },
  { id: '7', name: 'Direct Air Capture', standard: 'CAR', type: 'Carbon Removal', price: 185.00, available: 120, country: 'USA', vintage: 2024, verified: true, image: '🏭' },
  { id: '8', name: 'Cookstove Distribution', standard: 'GS', type: 'Community', price: 8.90, available: 5600, country: 'Ghana', vintage: 2024, verified: true, image: '🍳' },
];

// Mock User Portfolio
interface PortfolioItem {
  credit: CarbonCredit;
  amount: number;
  avgPrice: number;
  purchaseDate: string;
}

const MOCK_PORTFOLIO: PortfolioItem[] = [
  { credit: CARBON_CREDITS[0], amount: 150, avgPrice: 17.20, purchaseDate: '2024-11-15' },
  { credit: CARBON_CREDITS[1], amount: 80, avgPrice: 23.50, purchaseDate: '2024-12-01' },
  { credit: CARBON_CREDITS[4], amount: 200, avgPrice: 18.80, purchaseDate: '2025-01-10' },
];

// Mock Transactions
interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'retire';
  credit: string;
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  hash: string;
  status: 'confirmed' | 'pending';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'buy', credit: 'Amazon Basin REDD+', amount: 50, price: 18.50, total: 925, timestamp: '2025-01-20 14:32', hash: '0x8f3a...c2d1', status: 'confirmed' },
  { id: '2', type: 'retire', credit: 'Gold Standard Solar India', amount: 25, price: 24.30, total: 607.50, timestamp: '2025-01-19 09:15', hash: '0x3d7b...a9f4', status: 'confirmed' },
  { id: '3', type: 'buy', credit: 'Wind Power Kenya', amount: 100, price: 19.20, total: 1920, timestamp: '2025-01-18 16:45', hash: '0x1e5c...b7e2', status: 'confirmed' },
  { id: '4', type: 'sell', credit: 'Mangrove Restoration', amount: 75, price: 15.80, total: 1185, timestamp: '2025-01-17 11:20', hash: '0x6a9d...e3c8', status: 'confirmed' },
  { id: '5', type: 'buy', credit: 'CAR Reforestation', amount: 30, price: 21.80, total: 654, timestamp: '2025-01-16 08:55', hash: '0x4b2f...d1a7', status: 'confirmed' },
];

// Sidebar
function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'marketplace', label: 'Marketplace', icon: <ChartIcon /> },
    { id: 'portfolio', label: 'Portfolio', icon: <WalletIcon /> },
    { id: 'retire', label: 'Retire Credits', icon: <FireIcon /> },
    { id: 'transactions', label: 'Transactions', icon: <HistoryIcon /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d1410] border-r border-emerald-500/10 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <LeafIcon className="w-5 h-5 text-[#0a0f0d]" />
              </div>
              <span className="text-lg font-bold text-white">CO2<span className="text-emerald-400">Chain</span></span>
            </div>
            <button className="lg:hidden text-gray-400" onClick={() => setIsOpen(false)}>
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-emerald-500/10">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Landing
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Header
function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { price: ethPrice } = useEthPrice();

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-emerald-500/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <button className="lg:hidden text-gray-400" onClick={onMenuClick}>
        <MenuIcon />
      </button>

      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-emerald-500/10">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">
            {chainId === mainnet.id ? 'Ethereum' : chainId === polygon.id ? 'Polygon' : 'Unknown'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          ETH: <span className="text-white font-medium">${ethPrice > 0 ? ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isConnected && address ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">{formatAddress(address)}</span>
          </div>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </header>
  );
}

// Dashboard View
function DashboardView() {
  const { address, isConnected } = useAccount();
  const { price: ethPrice } = useEthPrice();
  const { data: ethBalance } = useBalance({ address });

  // Calculate portfolio stats
  const portfolioValue = MOCK_PORTFOLIO.reduce((acc, item) => {
    return acc + (item.amount * item.credit.price);
  }, 0);

  const totalCost = MOCK_PORTFOLIO.reduce((acc, item) => {
    return acc + (item.amount * item.avgPrice);
  }, 0);

  const totalCredits = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.amount, 0);
  const co2Offset = totalCredits; // 1 credit = 1 tonne CO2
  const roi = totalCost > 0 ? ((portfolioValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back{address ? `, ${address.slice(0, 6)}...` : ''} 👋
        </h1>
        <p className="text-gray-400">
          {isConnected 
            ? 'Your carbon credit portfolio is performing well. Keep making an impact!'
            : 'Connect your wallet to start trading carbon credits and offset your emissions.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">Portfolio Value</span>
            <WalletIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className={`flex items-center gap-1 text-xs mt-1 ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendUpIcon className="w-3 h-3" />
            {roi.toFixed(2)}% ROI
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">Credits Owned</span>
            <ChartIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCredits.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{MOCK_PORTFOLIO.length} projects</div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">CO₂ Offset</span>
            <LeafIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{co2Offset.toLocaleString()} t</div>
          <div className="text-xs text-gray-500 mt-1">tonnes of CO₂</div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">ETH Balance</span>
            <span className="text-xs text-gray-500">⟠</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {ethBalance ? (Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)).toFixed(4) : '0.0000'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ≈ ${ethBalance && ethPrice > 0 ? ((Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)) * ethPrice).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Credits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-emerald-500/10' : tx.type === 'sell' ? 'bg-blue-500/10' : 'bg-orange-500/10'
                  }`}>
                    <span className="text-sm">
                      {tx.type === 'buy' ? '🛒' : tx.type === 'sell' ? '💰' : '🔥'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-white capitalize">{tx.type}</div>
                    <div className="text-xs text-gray-500">{tx.credit}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">${tx.total.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{tx.amount} credits</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Credits */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Carbon Credits</h3>
          <div className="space-y-3">
            {CARBON_CREDITS.slice(0, 4).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl">
                    {credit.image}
                  </div>
                  <div>
                    <div className="text-sm text-white">{credit.name}</div>
                    <div className="text-xs text-gray-500">{credit.standard} • {credit.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-400">${credit.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">per tonne</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketplace View
function MarketplaceView() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isBuying, setIsBuying] = useState(false);

  const filteredCredits = filter === 'all' 
    ? CARBON_CREDITS 
    : CARBON_CREDITS.filter(c => c.standard === filter);

  const handleBuy = () => {
    if (!selectedCredit) return;
    setIsBuying(true);
    // Simulate transaction
    setTimeout(() => {
      setIsBuying(false);
      setSelectedCredit(null);
      setQuantity(1);
      alert(`Successfully purchased ${quantity} credits of ${selectedCredit.name}!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Carbon Credit Marketplace</h1>
          <p className="text-gray-400 text-sm mt-1">Browse and purchase verified carbon credits from projects worldwide</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'VCS', 'GS', 'CAR'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-black/30 text-gray-500 border border-gray-800 hover:border-emerald-500/20'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCredits.map((credit) => (
          <div key={credit.id} className="glass-card rounded-2xl p-5 transition-all duration-300 hover:border-emerald-500/30 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                {credit.image}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                credit.standard === 'VCS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                credit.standard === 'GS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {credit.standard}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              {credit.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{credit.type} • {credit.country}</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="text-lg font-bold text-emerald-400">${credit.price.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-sm font-medium text-white">{credit.available.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Vintage: {credit.vintage}</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Verified
              </span>
            </div>

            <button
              onClick={() => setSelectedCredit(credit)}
              className="w-full btn-primary py-2.5 rounded-xl text-sm text-white font-medium"
            >
              Buy Credits
            </button>
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isBuying && setSelectedCredit(null)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md border border-emerald-500/20">
            <button
              onClick={() => !isBuying && setSelectedCredit(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Buy Carbon Credits</h2>

            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-black/30">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                {selectedCredit.image}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{selectedCredit.name}</div>
                <div className="text-xs text-gray-500">{selectedCredit.standard} • ${selectedCredit.price.toFixed(2)} per tonne</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Quantity (tonnes CO₂)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={selectedCredit.available}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per credit</span>
                  <span className="text-white">${selectedCredit.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity</span>
                  <span className="text-white">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trading fee (1%)</span>
                  <span className="text-white">${(quantity * selectedCredit.price * 0.01).toFixed(2)}</span>
                </div>
                <div className="border-t border-emerald-500/10 pt-2 flex justify-between font-medium">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400 text-lg">
                    ${(quantity * selectedCredit.price * 1.01).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={isBuying}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBuying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  Confirm Purchase
                  <span className="text-sm opacity-80">
                    ${(quantity * selectedCredit.price * 1.01).toFixed(2)}
                  </span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Transaction will be submitted to Ethereum mainnet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Portfolio View
function PortfolioView() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view your carbon credit portfolio</p>
      </div>
    );
  }

  const totalValue = MOCK_PORTFOLIO.reduce((acc, item) => acc + (item.amount * item.credit.price), 0);
  const totalCredits = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Portfolio</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your carbon credit holdings</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-emerald-400">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-gray-500 mb-1">Total Credits</div>
          <div className="text-2xl font-bold text-white">{totalCredits.toLocaleString()}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-gray-500 mb-1">CO₂ Offset</div>
          <div className="text-2xl font-bold text-emerald-400">{totalCredits} tonnes</div>
        </div>
      </div>

      {/* Holdings */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-emerald-500/10">
          <h3 className="text-lg font-semibold text-white">Holdings</h3>
        </div>
        <div className="divide-y divide-emerald-500/5">
          {MOCK_PORTFOLIO.map((item, i) => {
            const currentValue = item.amount * item.credit.price;
            const costBasis = item.amount * item.avgPrice;
            const pnl = currentValue - costBasis;
            const pnlPct = (pnl / costBasis) * 100;

            return (
              <div key={i} className="p-4 sm:p-6 hover:bg-emerald-500/5 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                      {item.credit.image}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.credit.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.amount} credits • Avg: ${item.avgPrice.toFixed(2)} • {item.purchaseDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      <div className={`text-xs ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                    </div>
                    <button className="btn-secondary px-3 py-1.5 rounded-lg text-xs text-emerald-400">
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Retire View
function RetireView() {
  const { address, isConnected } = useAccount();
  const [selectedCredit, setSelectedCredit] = useState<number>(0);
  const [amount, setAmount] = useState<number>(10);
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isRetiring, setIsRetiring] = useState(false);

  const handleRetire = () => {
    setIsRetiring(true);
    setTimeout(() => {
      setIsRetiring(false);
      alert(`Successfully retired ${amount} tonnes of CO₂! Transaction hash: 0x${Math.random().toString(16).slice(2, 10)}...`);
    }, 2500);
  };

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <FireIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to retire carbon credits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Retire Carbon Credits</h1>
        <p className="text-gray-400 text-sm mt-1">Permanently offset your emissions and create an immutable record on-chain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retire Form */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Retirement Details</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Select Credit</label>
              <select
                value={selectedCredit}
                onChange={(e) => setSelectedCredit(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500/50"
              >
                {MOCK_PORTFOLIO.map((item, i) => (
                  <option key={i} value={i} className="bg-[#0a0f0d]">
                    {item.credit.name} ({item.amount} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Amount (tonnes CO₂)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={MOCK_PORTFOLIO[selectedCredit]?.amount || 0}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Beneficiary (optional)</label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="Company or individual name"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Retirement Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to your retirement certificate..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-emerald-500/20 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleRetire}
              disabled={isRetiring}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRetiring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Retiring Credits...
                </>
              ) : (
                <>
                  <FireIcon className="w-4 h-4" />
                  Retire {amount} tonnes CO₂
                </>
              )}
            </button>
          </div>
        </div>

        {/* Impact Preview */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Your Impact</h3>

          <div className="space-y-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <div className="text-4xl font-bold gradient-text mb-2">{amount}</div>
              <div className="text-sm text-gray-400">tonnes of CO₂ to be offset</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <span className="text-2xl">🌳</span>
                <div>
                  <div className="text-sm text-white">{Math.round(amount * 16)} trees</div>
                  <div className="text-xs text-gray-500">equivalent planted for 10 years</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <span className="text-2xl">🚗</span>
                <div>
                  <div className="text-sm text-white">{(amount * 2.3).toFixed(1)} months</div>
                  <div className="text-xs text-gray-500">of driving an average car</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <span className="text-2xl">🏠</span>
                <div>
                  <div className="text-sm text-white">{(amount * 0.4).toFixed(1)} homes</div>
                  <div className="text-xs text-gray-500">electricity for one year</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/20 border border-emerald-500/10">
              <div className="text-xs text-gray-500 mb-2">Retirement Certificate</div>
              <div className="text-sm text-white">
                A permanent, on-chain certificate will be minted to your wallet address upon retirement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Transactions View
function TransactionsView() {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<string>('all');

  const filteredTx = filter === 'all' 
    ? MOCK_TRANSACTIONS 
    : MOCK_TRANSACTIONS.filter(tx => tx.type === filter);

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view your transaction history</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400 text-sm mt-1">All your on-chain carbon credit transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'buy', 'sell', 'retire'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-black/30 text-gray-500 border border-gray-800 hover:border-emerald-500/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/10">
                <th className="text-left text-xs text-gray-500 font-medium p-4">Type</th>
                <th className="text-left text-xs text-gray-500 font-medium p-4">Credit</th>
                <th className="text-right text-xs text-gray-500 font-medium p-4">Amount</th>
                <th className="text-right text-xs text-gray-500 font-medium p-4">Price</th>
                <th className="text-right text-xs text-gray-500 font-medium p-4">Total</th>
                <th className="text-right text-xs text-gray-500 font-medium p-4">Date</th>
                <th className="text-right text-xs text-gray-500 font-medium p-4">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tx.type === 'sell' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">{tx.credit}</td>
                  <td className="p-4 text-sm text-white text-right">{tx.amount}</td>
                  <td className="p-4 text-sm text-gray-400 text-right">${tx.price.toFixed(2)}</td>
                  <td className="p-4 text-sm font-medium text-white text-right">${tx.total.toLocaleString()}</td>
                  <td className="p-4 text-xs text-gray-500 text-right">{tx.timestamp}</td>
                  <td className="p-4 text-xs text-gray-500 text-right font-mono">{tx.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Main Trading App
export default function TradingApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'marketplace': return <MarketplaceView />;
      case 'portfolio': return <PortfolioView />;
      case 'retire': return <RetireView />;
      case 'transactions': return <TransactionsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-gray-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="lg:ml-64">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
