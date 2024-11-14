import React from 'react';
import { PostProvider } from './PostProvider';
import { AccountProvider } from './AccountProvider';
import { combineProviders } from './CombineProvider';
import HomeProvider from './HomeProvider';
import TourProvider from './TourProvider';
import MapCheckinProvider from './MapCheckinProvider';
import AdminProvider from './AdminProvider';
// List all providers you want to combine
const providers = [  
  [PostProvider, {}], 
  [AccountProvider, {}],
  [HomeProvider,{}],
  [TourProvider,{}],
  [MapCheckinProvider, {}],
  [AdminProvider, {}]
  //add more providers here
];

const AppProviders = combineProviders(providers);

export default AppProviders;
