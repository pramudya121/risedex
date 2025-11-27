import { RISE_TESTNET, CONTRACTS } from './contracts';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  isNative?: boolean;
  isVerified?: boolean;
}

// Native ETH representation
export const NATIVE_ETH: Token = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  chainId: RISE_TESTNET.id,
  isNative: true,
  isVerified: true,
};

// Token List for RISE Testnet
export const TOKEN_LIST: Token[] = [
  NATIVE_ETH,
  {
    address: CONTRACTS[RISE_TESTNET.id].WETH,
    symbol: 'WETH',
    name: 'Wrapped ETH',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
  {
    address: '0x7E76eB292BDF45aE633d0Ff9E641B6C9f6254419',
    symbol: 'PRMZ',
    name: 'PRMZ Token',
    decimals: 18,
    logoURI: '/tokens/prmz.svg',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
  {
    address: '0x5Fa86c5e03eDc6F894826c84ace1ef704a891322',
    symbol: 'RISE',
    name: 'RiseBullish',
    decimals: 18,
    logoURI: '/tokens/rise.svg',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
  {
    address: '0x7115e9e830bf16D7629FfbE60B4D6B0920A5E369',
    symbol: 'SGN',
    name: 'SANGEN',
    decimals: 18,
    logoURI: '/tokens/sgn.svg',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
  {
    address: '0x1855C26D2540264A42e3F5Aa03EDbeEbDB598818',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
  {
    address: '0xD15b8348135BB498B5A4a05BBE008596a8BcaEc5',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    chainId: RISE_TESTNET.id,
    isVerified: true,
  },
];

// Get token by address
export const getTokenByAddress = (address: string): Token | undefined => {
  return TOKEN_LIST.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
};

// Get token by symbol
export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return TOKEN_LIST.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase()
  );
};

// Get fallback logo URL
export const getTokenLogoFallback = (address: string): string => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
};

// Check if address is WETH
export const isWETH = (address: string): boolean => {
  return address.toLowerCase() === CONTRACTS[RISE_TESTNET.id].WETH.toLowerCase();
};

// Check if token is native ETH
export const isNativeETH = (address: string): boolean => {
  return address.toLowerCase() === NATIVE_ETH.address.toLowerCase();
};
