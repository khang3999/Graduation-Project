import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ContentLoader, { Rect } from 'react-content-loader/native';

const SkeletonPost = () => {
  return (
    <View style={styles.container}>
      <ContentLoader 
        speed={2}
        width={400}
        height={160}
        viewBox="0 0 400 160"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="10" y="10" rx="5" ry="5" width="400" height="30" />
        <Rect x="0" y="40" rx="5" ry="5" width="400" height="30" />
        <Rect x="0" y="80" rx="5" ry="5" width="400" height="30" />
        <Rect x="0" y="120" rx="5" ry="5" width="400" height="30" />
      </ContentLoader>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default SkeletonPost