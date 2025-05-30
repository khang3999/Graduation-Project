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
    <View style={{ backgroundColor: '#f9f9f9', marginTop: 0, borderRadius: 20 }}>
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
            <Rect x="0" y="0" rx="30" ry="30" width="36" height="36" />
            {/* Name */}
            <Rect x="40" y="8" rx="5" ry="5" width="100" height="20" />
            {/* Save button */}
            <Rect x="225" y="5" rx="5" ry="5" width="18" height="26" />
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
            <Rect x="0" y="0" rx="20" ry="20" width={widthItem - 30} height={height / 2 - 26} />
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
              <Rect x="0" y="10" rx="5" ry="5" width="200" height="30" />
              {/* Day */}
              <Rect x="0" y="55" rx="5" ry="5" width="24" height="24" />
              <Rect x="30" y="57" rx="5" ry="5" width="60" height="20" />
              {/* Rating */}
              <Rect x="160" y="55" rx="5" ry="5" width="24" height="24" />
              <Rect x="190" y="57" rx="5" ry="5" width="45" height="20" />
              {/* Credit */}
              <Rect x="0" y="90" rx="5" ry="5" width="30" height="24" />
              <Rect x="36" y="92" rx="5" ry="5" width="70" height="20" />
              <Rect x="110" y="89" rx="5" ry="5" width="80" height="26" />
              <Rect x="196" y="87" rx="5" ry="5" width="2" height="32" />
              <Rect x="204" y="92" rx="5" ry="5" width="28" height="22" />
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
              <Rect x="0" y="0" rx="5" ry="5" width="70" height="18" />
              <Rect x={(widthItem - 30) / 2 - 35} y="0" rx="5" ry="5" width="70" height="18" />
              <Rect x={(widthItem - 30) - 70} y="0" rx="5" ry="5" width="70" height="18" />
            </ContentLoader>
          </View>
        </View>
      </View>
    </View>
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
    height: "100%",
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 10,
    paddingHorizontal: 15,
    borderTopWidth: 3,
    borderStyle: 'dotted',
    borderColor: '#d3d3d3',
  },
  tourItemTitle: {
    fontSize: 20,
    // fontFamily: 'NotoSans_600SemiBold',
    fontWeight: '500',
    marginBottom: 0
  },
  image: {
    flex: 1,
    borderRadius: 20,
    elevation: 10,
    // overlayColor: 'white'
  },
  tourFooterSection: {
    flexDirection: 'row',
    backgroundColor: iconColors.green5,
    // backgroundColor: '#7B9A6D',
    paddingBottom: 15,
    height: '12%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tourItemContentSection: {
    width: '100%',
    height: '28%',
    // padding: 10,
    borderTopWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#d3d3d3',
    justifyContent: 'space-around',
  },
  tourItemImageSection: {
    width: '100%',
    height: '50%',
    padding: 14,
    // paddingBottom: 20,
    borderRadius: 20,
  },
  tourItemHeader: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: 'red',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tourItem: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 460,
    width: widthItem,
    // overflow: 'hidden',
    elevation: 4
  }
})
export default SkeletonTourHome