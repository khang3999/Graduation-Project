import React from 'react';
import { Stack } from 'expo-router/stack';
import { createStackNavigator, Header } from "@react-navigation/stack";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
              contentStyle: {paddingTop: 50}
            }}>
            <Stack.Screen name="(auth)" options={{headerShown: false}}/>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="(admin)"/>
        </Stack>
    );
}