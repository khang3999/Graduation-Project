import React from 'react';
import { Stack } from 'expo-router/stack';
import { createStackNavigator, Header } from "@react-navigation/stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
    return (
        <GestureHandlerRootView style={{flex:1}}> 
        <Stack
            screenOptions={{
              contentStyle: {paddingTop: 50}
            }}>
            <Stack.Screen name="(auth)" options={{headerShown: false}}/>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="(user)" options={{headerShown: false}}/>
            <Stack.Screen name="(admin)"/>
        </Stack>
        </GestureHandlerRootView>
    );
}