import { useQuery } from '@tanstack/react-query';
import { 
  fetchTokenHolders, 
  fetchTokenTransfers, 
  fetchTokenInfo,
  TokenHolder,
  TokenTransfer,
  TokenInfo
} from '@/services/explorerApi';

export const useTokenHolders = (tokenAddress: string | undefined) => {
  return useQuery<TokenHolder[]>({
    queryKey: ['tokenHolders', tokenAddress],
    queryFn: () => fetchTokenHolders(tokenAddress!),
    enabled: !!tokenAddress,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useTokenTransfers = (tokenAddress: string | undefined) => {
  return useQuery<TokenTransfer[]>({
    queryKey: ['tokenTransfers', tokenAddress],
    queryFn: () => fetchTokenTransfers(tokenAddress!),
    enabled: !!tokenAddress,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTokenInfo = (tokenAddress: string | undefined) => {
  return useQuery<TokenInfo | null>({
    queryKey: ['tokenInfo', tokenAddress],
    queryFn: () => fetchTokenInfo(tokenAddress!),
    enabled: !!tokenAddress,
    staleTime: 60000, // 1 minute
  });
};
