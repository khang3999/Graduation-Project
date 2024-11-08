import React from 'react';
import { PostProvider } from './PostProvider';
import { AccountProvider } from './AccountProvider';
import { combineProviders } from './CombineProvider';

// List all providers you want to combine
const providers : [React.ComponentType<{ children: React.ReactNode }>, Record<string, any> | undefined][]= [  
  [PostProvider, {}], 
  [AccountProvider, {}],
  //add more providers here
];

const AppProviders = combineProviders(providers);

export default AppProviders;
