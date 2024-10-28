import { View, Text, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import ContentLoader, { Rect } from 'react-content-loader/native';

const SkeletonPost = () => {
  const { width } = Dimensions.get('window')
  return (
    <View style={{backgroundColor:'#f9f9f9', margin: 10, marginTop:0, borderRadius: 30 }}>
      <ContentLoader
        speed={2}
        width={400}
        height={410}
        viewBox="0 0 400 410"
        backgroundColor="#eaeaea"
        foregroundColor="#fcfcfc"
      >
        <Rect x="0" y="0" rx="30" ry="30" width={width - 20} height="410" />
        <Rect x="10" y="10" rx="30" ry="30" width='185' height="52" />
        <Rect x="290" y="10" rx="20" ry="20" width='55' height="35" />
        <Rect x="10" y="360" rx="20" ry="20" width='150' height="40" />
      </ContentLoader>
    </View>
  )
}

export default SkeletonPost