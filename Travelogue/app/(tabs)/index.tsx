import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import { router } from 'expo-router'
import SearchBar from '@/components/homePage/SearchBar'
import ToursComponent from '@/components/homePage/ToursComponent'
import TourList from '@/components/homePage/TourList'
import PostList from '@/components/homePage/PostList'

console.log('App is running from (tabs)/index.tsx');

const Home = () => {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View>
        <SearchBar></SearchBar>
      </View>
      {/* Tour section */}
      <View>
        <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
        {/* <TouchableOpacity onPress={() => { router.push('/(admin)/(account)/account') }}>
          <Text>admin</Text>
        </TouchableOpacity> */}
      </View>
      <TourList></TourList>
      {/* Post Section */}
      <Text style={[styles.textCategory]}>Những bài viết mới</Text>
      <PostList></PostList>
    </View>
  )
}
const styles = StyleSheet.create({
  tourItem: {

  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  textCategory: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: 500,
    alignSelf: 'flex-start',
    elevation: 10
  }
})


export default Home