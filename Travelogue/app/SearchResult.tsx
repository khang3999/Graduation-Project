import { View, Text } from 'react-native'
import React from 'react'
import { useAccount } from '@/contexts/AccountProvider'
import AvatarProfile from '@/components/profile/AvatarProfile';
import { Gallery } from 'iconsax-react-native';
import GalleryTabView from '@/components/profile/GalleryTabView';
import { Header } from '@react-navigation/stack';
import HeaderProfile from '@/components/profile/HeaderProfile';
export default function SearchResult() {
    const {searchedAccountData} = useAccount();
    
  return (
    <>
        <HeaderProfile isSearched={true} />
        <GalleryTabView isSearched={true}/>
    </>
  )
}