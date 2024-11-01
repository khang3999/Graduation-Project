import { View, Text } from 'react-native'
import React from 'react'
import { useAccount } from '@/contexts/AccountProvider'
import AvatarProfile from '@/components/profile/AvatarProfile';
import { Gallery } from 'iconsax-react-native';
import GalleryTabView from '@/components/profile/GalleryTabView';
export default function searchResult() {
    const {searchedAccountData} = useAccount();
    
  return (
    <>
        <AvatarProfile isSearched={true}/>
        <GalleryTabView userId={searchedAccountData.id} isSearched={true}/>
    </>
  )
}