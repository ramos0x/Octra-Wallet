import { RPCProvider } from '../types/wallet';

export function getActiveRPCProvider(): RPCProvider | null {
  const providers = JSON.parse(localStorage.getItem('rpcProviders') || '[]');
  const activeProvider = providers.find((p: RPCProvider) => p.isActive);
  
  if (activeProvider) {
    return activeProvider;
  }
  
  // Return default if no active provider
  const defaultProvider = {
    id: 'default',
    name: 'Octra Network (Default)',
    url: 'https://octra.network',
    headers: {},
    priority: 1,
    isActive: true,
    createdAt: Date.now()
  };
  
  // Save default provider if none exists
  localStorage.setItem('rpcProviders', JSON.stringify([defaultProvider]));
  
  return defaultProvider;
}

export async function makeRPCRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const provider = getActiveRPCProvider();
  
  if (!provider) {
    throw new Error('No RPC provider available');
  }
  
  // Construct full URL
  const url = `${provider.url}${endpoint}`;
  
  // Merge headers
  const headers = {
    'Content-Type': 'application/json',
    ...provider.headers,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}