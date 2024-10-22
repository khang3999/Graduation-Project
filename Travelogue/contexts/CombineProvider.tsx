import React, { ReactNode } from 'react';

// Define the type for a provider component
type ProviderProps = {
  children: ReactNode;
};

type ProviderComponent = React.ComponentType<ProviderProps>;

// A higher-order function to combine multiple providers
export const combineProviders = (providers: [ProviderComponent, Record<string, any> | undefined][]) => {
  return ({ children }: { children: ReactNode }) => {
    return providers.reduceRight((acc, [Provider, props]) => {
      return <Provider {...(props || {})}>{acc}</Provider>;
    }, children);
  };
};
