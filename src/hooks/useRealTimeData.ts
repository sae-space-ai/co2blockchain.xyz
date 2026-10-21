import { useState, useEffect, useCallback } from 'react';

// ============================================
// REAL-TIME DATA HOOKS
// Using CoinGecko API (free, no key required)
// and Ethereum public RPC endpoints
// ============================================

// Ethereum public RPC endpoints (no API key)
const ETH_RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum-rpc.publicnode.com',
  'https://1rpc.io/eth',
];

// CoinGecko API base (free tier, no API key)
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ============================================
// Ethereum RPC Helper
// ============================================
async function ethRpcCall(method: string, params: any[] = []): Promise<any> {
  let lastError: Error | null = null;
  
  for (const endpoint of ETH_RPC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: 1,
        }),
      });
      const data = await response.json();
      if (data.result) return data.result;
      if (data.error) throw new Error(data.error.message);
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All RPC endpoints failed');
}

// ============================================
// Hook: Real-time Ethereum Blockchain Data
// ============================================
export interface EthBlockData {
  blockNumber: number;
  gasPrice: number; // in Gwei
  baseFee: number; // in Gwei
  timestamp: number;
  transactions: number;
  hashRate: string;
  difficulty: string;
  peerCount: number;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useEthereumData() {
  const [data, setData] = useState<EthBlockData>({
    blockNumber: 0,
    gasPrice: 0,
    baseFee: 0,
    timestamp: 0,
    transactions: 0,
    hashRate: '0',
    difficulty: '0',
    peerCount: 0,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch multiple data points in parallel
      const [blockNumHex, gasPriceHex, block, peerCountHex] = await Promise.all([
        ethRpcCall('eth_blockNumber'),
        ethRpcCall('eth_gasPrice'),
        ethRpcCall('eth_getBlockByNumber', ['latest', false]),
        ethRpcCall('net_peerCount'),
      ]);

      const blockNumber = parseInt(blockNumHex, 16);
      const gasPriceWei = parseInt(gasPriceHex, 16);
      const gasPriceGwei = gasPriceWei / 1e9;
      const baseFeeWei = block.baseFeePerGas ? parseInt(block.baseFeePerGas, 16) : 0;
      const baseFeeGwei = baseFeeWei / 1e9;
      const timestamp = parseInt(block.timestamp, 16);
      const txCount = block.transactions ? block.transactions.length : 0;
      const peerCount = parseInt(peerCountHex, 16);

      setData(prev => ({
        ...prev,
        blockNumber,
        gasPrice: Math.round(gasPriceGwei * 100) / 100,
        baseFee: Math.round(baseFeeGwei * 100) / 100,
        timestamp,
        transactions: txCount,
        peerCount,
        loading: false,
        error: null,
        lastUpdate: new Date(),
      }));
    } catch (err) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 12000); // ~Ethereum block time
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}

// ============================================
// Hook: Real-time Crypto Prices (CoinGecko)
// ============================================
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
}

export function useCryptoPrices(ids: string[] = ['ethereum', 'matic-network', 'chainlink', 'the-graph', 'uniswap']) {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const idsStr = ids.join(',');
      const response = await fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${idsStr}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const mapped: CryptoPrice[] = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        volume24h: coin.total_volume || 0,
        high24h: coin.high_24h || 0,
        low24h: coin.low_24h || 0,
        sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [],
      }));

      setPrices(mapped);
      setLoading(false);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [ids.join(',')]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every 60s (CoinGecko free tier limit)
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, error, lastUpdate, refetch: fetchPrices };
}

// ============================================
// Hook: Real-time Gas Tracker
// ============================================
export interface GasData {
  slow: number;
  standard: number;
  fast: number;
  estimatedTime: { slow: string; standard: string; fast: string };
}

export function useGasTracker() {
  const [gas, setGas] = useState<GasData>({
    slow: 0,
    standard: 0,
    fast: 0,
    estimatedTime: { slow: '', standard: '', fast: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGas = async () => {
      try {
        const gasPriceHex = await ethRpcCall('eth_gasPrice');
        const gasPriceGwei = parseInt(gasPriceHex, 16) / 1e9;
        
        // Calculate tiers based on current gas price
        const slow = Math.round((gasPriceGwei * 0.85) * 100) / 100;
        const standard = Math.round(gasPriceGwei * 100) / 100;
        const fast = Math.round((gasPriceGwei * 1.2) * 100) / 100;

        setGas({
          slow,
          standard,
          fast,
          estimatedTime: {
            slow: '~5 min',
            standard: '~30 sec',
            fast: '~15 sec',
          },
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchGas();
    const interval = setInterval(fetchGas, 15000);
    return () => clearInterval(interval);
  }, []);

  return { ...gas, loading };
}

// ============================================
// Hook: Real-time Market Data (Global)
// ============================================
export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

export function useGlobalMarket() {
  const [data, setData] = useState<GlobalMarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const response = await fetch(`${COINGECKO_BASE}/global`);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        const d = json.data;
        
        setData({
          totalMarketCap: d.total_market_cap?.usd || 0,
          totalVolume: d.total_volume?.usd || 0,
          btcDominance: d.market_cap_percentage?.btc || 0,
          ethDominance: d.market_cap_percentage?.eth || 0,
          activeCryptos: d.active_cryptocurrencies || 0,
          marketCapChange24h: d.market_cap_change_percentage_24h_usd || 0,
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchGlobal();
    const interval = setInterval(fetchGlobal, 120000); // Every 2 min
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
}

// ============================================
// Hook: ETH Price in USD (simple)
// ============================================
export function useEthPrice() {
  const [price, setPrice] = useState<number>(0);
  const [change, setChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `${COINGECKO_BASE}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`
        );
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setPrice(data.ethereum?.usd || 0);
        setChange(data.ethereum?.usd_24h_change || 0);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return { price, change, loading };
}

// ============================================
// Utility: Format numbers
// ============================================
export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
}
