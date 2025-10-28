// FIX: Import React to use React.createElement for JSX replacement.
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { getApiClient } from '../services/api';
import type { ApiClient } from '../types';

type AdapterType = 'mock' | 'http';

interface ApiContextType {
  api: ApiClient;
  adapterType: AdapterType;
  setAdapterType: (type: AdapterType) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [adapterType, setAdapterTypeState] = useState<AdapterType>(() => {
    return (localStorage.getItem('apiAdapter') as AdapterType) || 'mock';
  });

  const setAdapterType = (type: AdapterType) => {
    localStorage.setItem('apiAdapter', type);
    setAdapterTypeState(type);
    window.location.reload(); // Force reload to re-initialize the client
  };

  const api = useMemo(() => getApiClient(adapterType), [adapterType]);

  const value = { api, adapterType, setAdapterType };

  // FIX: Replace JSX with React.createElement to avoid parsing errors in .ts file.
  return React.createElement(ApiContext.Provider, { value }, children);
};

export const useApiClient = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  return context;
};