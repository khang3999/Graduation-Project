import React from "react";
import { Stack } from "expo-router/stack";
import { createStackNavigator, Header } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import  AppProvider  from "../contexts/AppProvider";
import Toast from "react-native-toast-message-custom";

export default function Layout() {
  return (
    <AppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="(user)" options={{headerShown: false}}/>
            <Stack.Screen name="(article)" options={{headerShown: false}}/>
            <Stack.Screen name="(admin)"/>
        </Stack>
        <Toast/>
       
      </GestureHandlerRootView>
    </AppProvider>
  );
}
