import { View, Text } from 'react-native'
import React from 'react'

export default function logHeight() {
    const onLayoutHandler = (event: any) => {
        const { height } = event.nativeEvent.layout;
        console.log('Element height:', height); // In ra chiều cao của element
    };
}