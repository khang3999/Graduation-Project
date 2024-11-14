import React from 'react';
import { PostProvider } from './PostProvider';
import { AccountProvider } from './AccountProvider';
import { combineProviders } from './CombineProvider';
import HomeProvider from './HomeProvider';
import TourProvider from './TourProvider';
import MapCheckinProvider from './MapCheckinProvider';
// List all providers you want to combine
const providers = [  
  [PostProvider, {}], 
  [AccountProvider, {}],
  [HomeProvider,{}],
  [TourProvider,{}],
  [MapCheckinProvider, {}]
  //add more providers here
];

const AppProviders = combineProviders(providers);

export default AppProviders;
