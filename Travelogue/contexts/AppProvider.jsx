import React from 'react';
import { PostProvider } from './PostProvider';
import { AccountProvider } from './AccountProvider';
import { combineProviders } from './CombineProvider';
import HomeProvider from './HomeProvider';
import TourProvider from './TourProvider';
// List all providers you want to combine
const providers = [  
  [PostProvider, {}], 
  [AccountProvider, {}],
  [HomeProvider,{}],
  [TourProvider,{}]
  //add more providers here
];

const AppProviders = combineProviders(providers);

export default AppProviders;
