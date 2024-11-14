import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, Dimensions, TextInput } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, database, onValue, ref } from "@/firebase/firebaseConfig";
import SearchBar from '@/components/homePage/SearchBar'
import PostList from '@/components/homePage/PostList'
import TourSection from "@/components/homePage/TourSection";
import HomeProvider, { useHomeProvider } from "@/contexts/HomeProvider";
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list'
import { AntDesign } from "@expo/vector-icons";
import { Badge } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccount } from "@/contexts/AccountProvider";
import {  off } from "firebase/database";


const Home = () => {

  const {
    dataModalSelected,
    setDataModalSelected,
    dataAllCities,
    setDataAllCities,
    isFocus, setIsFocus,dataAccount }: any = useHomeProvider();
    
  
  
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', marginHorizontal: 10, gap: 6 }}>
        <Text>Hiển thị: </Text>
        {dataModalSelected == null ?
          <Badge size={24} style={{ fontSize: 12 }} theme={{ colors: { primary: 'green' } }}>Tất cả bài viết</Badge>
          :
          <>
            {dataModalSelected.input !== '' && <Badge size={24} style={{ fontSize: 12 }}>{dataModalSelected.input}</Badge>}
            {dataModalSelected.cities.length <= 0 && dataModalSelected.country !== '' ?
              <Badge size={24} style={{ fontSize: 12 }}>{dataModalSelected.country}</Badge>
              :
              dataModalSelected.cities.map((cityId: any) => {
                const found = dataAllCities.find((obj: any) => obj[cityId] !== undefined);
                console.log(found);
                return <Badge size={24} style={{ fontSize: 12 }} >{found[cityId]}</Badge>
              })
            }
          </>}
      </View>

      {/* Tour section */}
      <TourSection></TourSection>
      {/* Post Section */}
      <PostList ></PostList>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: 'white'
  },
})

export default Home;