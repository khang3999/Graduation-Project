import { View, Text } from 'react-native'
import React from 'react'

const CutText = (text:any) => {
    return text.length > 35 ? text.substring(0, 20) + '...' : text;
}

export default CutText