import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons'
import { Divider, IconButton, Menu, PaperProvider } from 'react-native-paper'
import { TourModal } from '../homePage/TourItem'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { useAccount } from '@/contexts/AccountProvider'
import { database, ref, update } from '@/firebase/firebaseConfig'
import { router } from 'expo-router'
import { formatDate } from '@/utils/commons'
import { backgroundColors, iconColors } from '@/assets/colors'
import ActionBar from '../actionBars/ActionBar'
import HeartButton from '../buttons/HeartButton'
import SaveButton from '../buttons/SaveButton'
import LiveModeButton from '../buttons/LiveModeButton'
import { useAdminProvider } from '@/contexts/AdminProvider'
import { formatNumberLike } from '@/utils'

const ITEM_HEIGHT = 270;
const TYPE = 1;

type Props = {
  data: TourModal,
  index: number,
  liked: boolean,
  // userId: string,
  // onTapLocationItemMenu?: (selectedCityId: string, selectedCountryId: string, userId: string) => void | undefined,
  onTapToViewDetail?: (path: any, postId: string) => void | undefined
  onTapToViewProfile?: (authorId: string) => Promise<void> | undefined,
};
const TourItemTourScreen = ({ data, index, liked, onTapToViewDetail, onTapToViewProfile }: Props) => {
  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);
  const { userId }: any = useHomeProvider()
  const { likedPostsList, setLikedPostsList }: any = useAccount()
  const { areasByProvinceName }: any = useAdminProvider()

  const handleTapOnLocationInMenu = useCallback(async (location: any, userId: string) => {
    const areaId = areasByProvinceName[location.name]
    // Update hành vi lên firebase
    // 1. Lưu lên firebase
    const refBehavior = ref(database, `accounts/${userId}/behavior`);
    const dataUpdate = {
      content: "",
      location: [location.id],
    };
    await update(refBehavior, dataUpdate);
    router.push({
      pathname: "/galleryCities",
      params: { idCity: location.id, idCountry: location.country, idArea: areaId },
    });
  }, [areasByProvinceName])

  const allLocations = useMemo(() => {
    if (!data.locations) {
      return []
    }
    return Object.keys(data.locations).flatMap((country) =>
      Object.entries(data.locations[country]).map(([id, name]) => ({
        id,
        name,
        country,
      }))
    );
  }, []);

  let rating = data.ratingSummary.totalRatingValue / data.ratingSummary.totalRatingCounter
  rating = Math.ceil(rating * 2) / 2
  rating = isNaN(rating) ? 0 : rating

  const originalPrice = data.money
  const promotionalPrice = data.money * (100 - data.discountTour) / 100
  return (
    <PaperProvider key={data.id}>
      <TouchableOpacity style={styles.item}
        onPress={() => onTapToViewDetail?.("/tourDetail", data.id)}
      // onLongPress={() => handleLongPressOnItemTour()}
      >
        <View style={styles.tourContentHeader}>
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => onTapToViewProfile?.(data.author.id)}>
              <Image style={styles.avatar} source={{ uri: data.author.avatar }}></Image>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', marginHorizontal: 4 }}>
              <TouchableOpacity onPress={() => onTapToViewProfile?.(data.author.id)}>
                <Text style={{ fontWeight: '500' }} numberOfLines={1}>
                  {data.author.fullname}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontStyle: 'italic', fontSize: 12 }}>{formatDate(data.created_at)}</Text>
            </View>
          </View>
          {/* Live mode */}
          {/* <View style={styles.liveModeWrap}>
            <LiveModeButton type="1"></LiveModeButton>
          </View> */}
          {/* Location */}
          <View style={styles.flagBtn}>
            {/* <Provider > */}
            <Menu
              style={styles.listLocations}
              visible={indexVisibleMenu === index} // Thay the 1 bang index của post trong mang
              onDismiss={() => setIndexVisibleMenu(-1)}
              theme={''}
              elevation={4}
              // statusBarHeight={0}
              anchorPosition='bottom'
              contentStyle={{ backgroundColor: 'white', }}
              anchor={
                <View style={{ alignItems: "center" }}>
                  <IconButton
                    style={{ backgroundColor: 'white', width: 40, height: 30 }}
                    icon="map-marker-radius"
                    iconColor={iconColors.green1}
                    size={22}
                    onPress={() => setIndexVisibleMenu(index)}
                    accessibilityLabel="Menu button"
                  />
                </View>
              }
            >
              {allLocations.map((location: any) => {
                return (
                  <TouchableOpacity key={location?.id} onPress={() => handleTapOnLocationInMenu?.(location, userId)}>
                    <Menu.Item title={location.name} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                    <Divider />
                  </TouchableOpacity>
                )
              })
              }
            </Menu>
            {/* </Provider> */}
          </View>
        </View>


        <View style={styles.imageTour}>
          <Image style={styles.imageTour} source={{ uri: data.thumbnail }}></Image>
          <View style={styles.itemOverplay}></View>
        </View>

        {/* <View style={styles.priceBackground}>
          {data.discountTour !== 0 ?
            <View style={styles.priceWrap}>
              <Entypo style={{ paddingHorizontal: 8 }} name="price-tag" size={22} color={iconColors.green2} />
              <View style={{ paddingRight: 10 }}>
                <Text style={{ textDecorationLine: 'line-through', color: 'grey' }}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                <Text style={{ fontSize: 16, color: 'white', fontWeight: "500" }}>{promotionalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
              </View>
            </View>
            :
            // <View style={styles.priceBackground}>
            <View style={styles.priceWrap}>
              <Entypo style={{ paddingHorizontal: 8 }} name="price-tag" size={22} color={iconColors.green2} />
              <View style={{ paddingRight: 10 }}>
                <Text style={{ fontSize: 16, color: 'white', fontWeight: "500" }}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
              </View>
            </View>
            // </View>
          }
        </View> */}


        <View style={styles.footer}>
          {/* Button like, comment, save */}
          <View style={styles.actionBar}>
            {/* LIKE BUTTON */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 5, zIndex: 3, gap: 6, justifyContent: 'center', alignItems: 'center' }} >
              <AntDesign name={'hearto'} size={20} color='white' />
              <Text style={{ color: 'white' }}>{formatNumberLike(data.likes)}</Text>
            </View>
            {/* COMMENT BUTTON */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 5, zIndex: 3, gap: 6, justifyContent: 'center', alignItems: 'center' }} >
              <FontAwesome name="comment-o" size={20} color="white" />
              <Text style={{ color: 'white' }}>{data.comments ? formatNumberLike(Object.keys(data.comments).length) : '0'}</Text>
            </View>
          </View>

          <View style={styles.rating}>
            <Text style={styles.textRating}>{`${rating.toFixed(1)}`}</Text>
            {/* <Text style={styles.textRating}> Đánh giá: {`${rating.toFixed(1)} / 5.0`}</Text> */}
            <FontAwesome name="star" size={20} color="#F6CE00" style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.priceWrap}>
            <Entypo style={{ paddingHorizontal: 6 }} name="price-tag" size={18} color={iconColors.green1} />
            <View style={{ paddingRight: 4 }}>
              {data.discountTour !== 0 && (
                <Text style={{ textDecorationLine: 'line-through', color: 'grey', fontSize:11 }}>
                  {originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              )}
              <Text style={{  color: 'black', fontWeight: "500" }}>
                {(data.discountTour !== 0 ? promotionalPrice : originalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity >
    </PaperProvider >
  )
}

export default TourItemTourScreen

const styles = StyleSheet.create({
  liveModeWrap: {
  },
  btn: {
    backgroundColor: 'white',
    height: 40,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal:10,
    gap: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  itemOverplay: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  textRating: {
    color: 'white',
    // justifyContent: 'flex-end'
    fontWeight: '500'
  },
  rating: {
    flexDirection: 'row',
    // position: 'absolute',
    // backgroundColor: 'white',
    // backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
  },
  priceWrap: {
    flexDirection: 'row',
    // backgroundColor: backgroundColors.background1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    // height: 40,
    padding: 4
  },
  priceBackground: {
    // position: 'absolute',
    // backgroundColor: iconColors.green1,
    // backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    borderRadius: 10,
    // bottom: 60,
    // left: 10,
  },
  imageTour: {
    height: ITEM_HEIGHT,
    // backgroundColor: 'red',
    borderRadius: 20,
  },
  itemLocation: {
    padding: 0,
    fontSize: 14,
    width: 'auto',
    textAlign: 'center',
  },
  listLocations: {
    width: 'auto',
    top: 50,
  },
  flagBtn: {
    flex: 1,
    zIndex: 3,
    alignItems: 'flex-end'
  },
  avatar: {
    borderRadius: 90,
    width: 34,
    height: 34,
  },
  avatarWrap: {
    borderRadius: 90,
    width: 34,
    height: 34,
    backgroundColor: 'grey',
    elevation: 3
  },
  authorContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    maxWidth: 200,
    padding: 4,
    borderRadius: 90,
    zIndex: 3
  },
  tourContentHeader: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    // backgroundColor: 'red',
    zIndex: 3,
    padding: 10
  },
  item: {
    height: 270,
    position: "relative",
    borderRadius: 20,
    elevation: 6
  },
  actionBar: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
})