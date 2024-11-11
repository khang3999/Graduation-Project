import { View, Text } from 'react-native'
import React from 'react'

export function logHeight() {
    const onLayoutHandler = (event: any) => {
        const { height } = event.nativeEvent.layout;
        console.log('Element width:', height); // In ra chiều cao của element
    };
}