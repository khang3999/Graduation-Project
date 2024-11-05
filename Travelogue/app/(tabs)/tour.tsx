import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import PostList from '@/components/homePage/PostList'
import TourList from '@/components/tours/TourList'
import { useTourProvider } from '@/contexts/TourProvider'
import { Badge } from 'react-native-paper'
import { useHomeProvider } from '@/contexts/HomeProvider'

const Tour = () => {
  const {
    dataModalSelected, setDataModalSelected

  }:any = useTourProvider()
  const {dataAllCities}: any = useHomeProvider()
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', margin: 10, gap: 6 }}>
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
      <TourList></TourList>
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