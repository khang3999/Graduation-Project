import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import ContentLoader, { Rect } from 'react-content-loader/native'

const SkeletonTourHome = () => {
  const { width } = Dimensions.get('window')
  return (
    <View style={{ backgroundColor: '#f9f9f9', marginTop: 0, borderRadius: 10 }}>
      <ContentLoader
        speed={2}
        width={(width - 40) / 3}
        height={90}
        backgroundColor="#eaeaea"
        foregroundColor="#fcfcfc"
      >
        <Rect x="0" y="0" rx="10" ry="10" width={(width - 40) / 3} height="90" />
        {/* <Rect x="0" y="100" rx="0" ry="0" width={(width - 40)/3} height="30" /> */}
      </ContentLoader>
    </View>
  )
}

export default SkeletonTourHome