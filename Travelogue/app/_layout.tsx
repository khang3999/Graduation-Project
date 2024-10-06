<<<<<<< HEAD
import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name='admin' component={}>
            </Stack.Screen>
        </Stack>

    )
}

export default _layout
=======
import { Stack } from 'expo-router/stack';
import { createStackNavigator, Header } from "@react-navigation/stack";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
              contentStyle: {paddingTop: 50}
            }}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="(admin)"/>
        </Stack>
    );
}
>>>>>>> 1c10ec0ff9f61229c1f01828fbc5e8db9bbfb2d2
