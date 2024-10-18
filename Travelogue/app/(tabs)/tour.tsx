import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import SearchBar from '@/components/homePage/SearchBar'
import PostList from '@/components/homePage/PostList'
import TourList from '@/components/tours/TourList'

const Tour = () => {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View>
        <SearchBar></SearchBar>
      </View>
      {/* Tour section */}
      {/* <View className="flex-row">
        <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
        <TouchableOpacity className='mt-5' onPress={() => { router.push('/(admin)/(account)/account') }}>
          <Text>admin</Text>
        </TouchableOpacity>
      </View> */}
      {/* <TourList></TourList> */}
      {/* Post Section */}
      {/* <Text style={[styles.textCategory]}>Những bài viết mới</Text> */}
      <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
      <TourList></TourList>
      {/* <ButtonComponent
        text="Đăng xuất"
        color={appColors.danger}
        onPress={handleLogout}
      /> */}
    </View>
  )
}

const styles = StyleSheet.create({
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
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
})
export default Tour