import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import ContentLoader, { Rect } from 'react-content-loader/native'
import { ColorProperties } from 'react-native-reanimated/lib/typescript/reanimated2/Colors'
import { create } from 'lodash'
import { StyleSheet } from 'react-native'
import { backgroundColors, iconColors } from '@/assets/colors'

const { width } = Dimensions.get('window')
const widthItem = width * 2 / 3
const height = 460
const SkeletonTourHome = () => {
  return (
    // <View style={{ backgroundColor: '#f9f9f9', marginTop: 0, borderRadius: 20 }}>
    <View style={styles.tourItem}>
      <View style={styles.tourItemHeader}>
        <ContentLoader
          speed={2}
          width={widthItem}
          height="100%"
          backgroundColor="#eaeaea"
          foregroundColor="#fcfcfc"
        >
          {/* Avatar */}
          {/* <Rect x="0" y="10" rx="30" ry="30" width="30" height="30" /> */}
          {/* Name */}
          {/* <Rect x="35" y="16" rx="5" ry="5" width="100" height="20" /> */}
         
          <Rect x="0" y="10" rx="20" ry="20" width="150" height="40" />
          {/* <Rect x="225" y="5" rx="5" ry="5" width="18" height="26" /> */}
        </ContentLoader>
      </View>
      <View style={styles.tourItemImageSection}>
        <ContentLoader
          speed={2}
          width={widthItem}
          height="100%"
          backgroundColor="#eaeaea"
          foregroundColor="#fcfcfc"
        >
          {/* Image */}
          <Rect x="0" y="0" rx="20" ry="20" width={widthItem - 30} height={180} />
        </ContentLoader>
      </View>
      <View style={styles.tourItemContentSection}>
        <View style={{ paddingHorizontal: 20 }}>
          <ContentLoader
            speed={2}
            width={widthItem}
            height="100%"
            backgroundColor="#eaeaea"
            foregroundColor="#fcfcfc"
          >
            {/* Title */}
            <Rect x="0" y="7" rx="5" ry="5" width="180" height="20" />
            {/* Day */}
            <Rect x="0" y="34" rx="5" ry="5" width="24" height="24" />
            <Rect x="30" y="36" rx="5" ry="5" width="60" height="20" />
            {/* Rating */}
            <Rect x="160" y="34" rx="5" ry="5" width="24" height="24" />
            <Rect x="190" y="36" rx="5" ry="5" width="45" height="20" />
            {/* Credit */}
            <Rect x="0" y="67" rx="5" ry="5" width="30" height="24" />
            <Rect x="36" y="69" rx="5" ry="5" width="70" height="20" />
            <Rect x="110" y="66" rx="5" ry="5" width="80" height="26" />
            <Rect x="196" y="64" rx="5" ry="5" width="2" height="32" />
            <Rect x="204" y="68" rx="5" ry="5" width="28" height="22" />
          </ContentLoader>
        </View>
        <View style={[styles.dotCustom, { left: -10, borderLeftWidth: 0, }]}></View>
        <View style={[styles.dotCustom, { right: -10 }]}></View>
      </View>

      <View style={styles.tourFooterSection}>
        <View style={styles.locationWrap}>
          <ContentLoader
            speed={2}
            width={widthItem}
            height="100%"
            backgroundColor="#eaeaea"
            foregroundColor="#fcfcfc"
          >
            {/* Footer */}
            <Rect x="0" y="0" rx="5" ry="5" width="70" height="15" />
            <Rect x={(widthItem - 30) / 2 - 35} y="0" rx="5" ry="5" width="70" height="15" />
            <Rect x={(widthItem - 30) - 70} y="0" rx="5" ry="5" width="70" height="15" />
          </ContentLoader>
        </View>
        <View style={{ height: 10, width: '100%', backgroundColor: iconColors.green5, }}></View>
      </View>
    </View>
    // </View>
  )
}
const styles = StyleSheet.create({
  tourDiscountedPrice: {
    fontSize: 18,
  },
  tourOriginalPrice: {
    textDecorationLine: 'line-through',
    color: '#c1c1c1'
  },
  tourPriceContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotCustom: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: backgroundColors.background1,
    top: -10,
  },
  locationWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 6,
    paddingHorizontal: 15,
    borderTopWidth: 3,
    borderStyle: 'dotted',
    borderColor: '#d3d3d3',
  },
  tourItemTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 0
  },
  image: {
    flex: 1,
    borderRadius: 20,
    elevation: 10,
  },
  tourFooterSection: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tourItemContentSection: {
    width: '100%',
    height: 106,
    borderTopWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#d3d3d3',
    justifyContent: 'space-around',
  },
  tourItemImageSection: {
    height: 214,
    width: '100%',
    padding: 14,
    borderRadius: 20,
  },
  tourItemHeader: {
    height: 58,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tourItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 2 / 3,
    elevation: 4
  }
})
export default SkeletonTourHome