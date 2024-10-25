import React from 'react';
import { PostProvider } from './PostProvider';
import { AccountProvider } from './AccountProvider';
import { combineProviders } from './CombineProvider';
import HomeProvider from './HomeProvider';

// List all providers you want to combine
const providers = [  
  [PostProvider, {}], 
  [AccountProvider, {}],
  [HomeProvider,{}]
  //add more providers here
];

const AppProviders = combineProviders(providers);

export default AppProviders;
