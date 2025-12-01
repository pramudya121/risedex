// RISE Testnet Blockscout Explorer API
const EXPLORER_API_BASE = 'https://explorer.testnet.riselabs.xyz/api';

export interface TokenHolder {
  address: string;
  value: string;
  percentage?: number;
}

export interface TokenTransfer {
  hash: string;
  blockNumber: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimal: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
  holders: string;
  transferCount: string;
}

// Fetch token holders from explorer API
export const fetchTokenHolders = async (tokenAddress: string): Promise<TokenHolder[]> => {
  try {
    const response = await fetch(
      `${EXPLORER_API_BASE}?module=token&action=getTokenHolders&contractaddress=${tokenAddress}&page=1&offset=10`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result.map((holder: any) => ({
        address: holder.address,
        value: holder.value,
        percentage: holder.share ? parseFloat(holder.share) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }
};

// Fetch token transfers/transactions
export const fetchTokenTransfers = async (tokenAddress: string): Promise<TokenTransfer[]> => {
  try {
    const response = await fetch(
      `${EXPLORER_API_BASE}?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=20&sort=desc`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        timestamp: tx.timeStamp,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        tokenSymbol: tx.tokenSymbol,
        tokenName: tx.tokenName,
        tokenDecimal: tx.tokenDecimal,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    return [];
  }
};

// Fetch token info
export const fetchTokenInfo = async (tokenAddress: string): Promise<TokenInfo | null> => {
  try {
    const response = await fetch(
      `${EXPLORER_API_BASE}?module=token&action=getToken&contractaddress=${tokenAddress}`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return {
        name: data.result.name,
        symbol: data.result.symbol,
        decimals: data.result.decimals,
        totalSupply: data.result.totalSupply,
        holders: data.result.holdersCount || '0',
        transferCount: data.result.transfersCount || '0',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
};

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format token value with decimals
export const formatTokenValue = (value: string, decimals: number): string => {
  if (!value) return '0';
  const num = parseFloat(value) / Math.pow(10, decimals);
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
};

// Format timestamp to relative time
export const formatRelativeTime = (timestamp: string): string => {
  const now = Date.now();
  const time = parseInt(timestamp) * 1000;
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
