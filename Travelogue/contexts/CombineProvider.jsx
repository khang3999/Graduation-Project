import React, { ReactNode } from 'react';

// Define the type for a provider component

// A higher-order function to combine multiple providers
export const combineProviders = (providers) => {
  return ({ children }) => {
    return providers.reduceRight((acc, [Provider, props]) => {
      return <Provider {...(props || {})}>{acc}</Provider>;
    }, children);
  };
};
