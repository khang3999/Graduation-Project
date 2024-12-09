import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import PostList from '@/components/homePage/PostList'
import TourList from '@/components/tours/TourList'
import { useTourProvider } from '@/contexts/TourProvider'
import { Badge } from 'react-native-paper'
import { useHomeProvider } from '@/contexts/HomeProvider'
const Tour = () => {
  const {
    dataModalSelected, setDataModalSelected,
    selectedTypeSearch, dataTypeSearch
  }: any = useTourProvider()
  const { dataAllCities }: any = useHomeProvider()
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', margin: 10, gap: 6 }}>
      <Text style={{fontWeight:'600'}}>Hiển thị: </Text>
        {dataModalSelected == null ?
          <Badge size={24} style={styles.badgeText}>Tất cả tour</Badge>
          :
          <>
            {dataModalSelected.input !== '' && <Badge size={24} style={styles.badgeText}>{dataModalSelected.input}</Badge>}
            {dataModalSelected.cities.length <= 0 && dataModalSelected.country !== '' ?
              <Badge size={24} style={styles.badgeText}>{dataModalSelected.country}</Badge>
              :
              (dataModalSelected.cities).map((cityId: any) => {
                const found = dataAllCities.find((obj: any) => obj[cityId] !== undefined);
                // console.log(found);
                return <Badge key={cityId} size={24} style={styles.badgeText}>{found[cityId]}</Badge>
              })
            }
          </>}
          <Badge size={24} style={{ fontSize: 13, backgroundColor: '#f4b7b7', color: 'black', paddingHorizontal: 6, fontWeight: '500' }}>{dataTypeSearch[selectedTypeSearch.current-1].value}</Badge>

        {/* {selectedTypeSearch.current === 1 ?
          <Badge size={24} style={{ fontSize: 12 }} theme={{ colors: { primary: 'green' } }}>{dataTypeSearch[selectedTypeSearch].value}</Badge>
          :
          <Badge size={24} style={{ fontSize: 12 }} theme={{ colors: { primary: 'green' } }}>Thích nhiều nhất</Badge>
        } */}
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
  },
  badgeText: {
    fontSize: 13, 
    backgroundColor: '#b9e0f7', 
    color: 'black', 
    paddingHorizontal: 6, 
    fontWeight: '500'
  }
})
export default Tour