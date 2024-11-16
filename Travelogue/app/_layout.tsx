import React from "react";
import { Stack } from "expo-router/stack";
import { createStackNavigator, Header } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppProvider from "../contexts/AppProvider";
import Toast from "react-native-toast-message-custom";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function Layout() {
  const colorScheme = useColorScheme();
  return (
    <AppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(user)" options={{ headerShown: false }} />
          <Stack.Screen name="(article)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="notify" options={{ headerShown: true }}/>
          <Stack.Screen name="accountDetail" options={{
            headerShown: true,
            title: "Chi tiết tài khoản",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerTitleAlign: "center",
          }}/>
          <Stack.Screen name="companyDetail" options={{
            headerShown: true,
            title: "Chi tiết doanh nghiệp",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerTitleAlign: "center",
          }}/>
          <Stack.Screen name="postDetail" options={{
            headerShown: true,
            title: "Bài viết",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="tourDetail" 
           options={{
            headerShown: true,
            title: "Tours",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerTitleAlign: "center",
          }}/>

        </Stack>
        <Toast />

      </GestureHandlerRootView>
    </AppProvider>
  );
}
