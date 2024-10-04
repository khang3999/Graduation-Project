import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack >
      <Stack.Screen name='(tabs)/index'></Stack.Screen>
      <Stack.Screen name='screens/admin/account/account' options={{
        headerShown:false
      }}></Stack.Screen>
    </Stack>
  )
}

export default _layout