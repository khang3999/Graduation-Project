import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'

const UnlockBtn = ({...props}) => {
    const handleUnlock = ()=>{

    }
  return (
    <View>
      <TouchableOpacity
        style={{...props}}
        onPress={handleUnlock}
      >
        <Text>SA</Text>
      <AntDesign name="unlock" size={24} color="black" />
      </TouchableOpacity>
    </View>
  )
}

export default UnlockBtn