import { Stack, Tabs } from "expo-router";
import React from "react";

import TabBar from '@/components/navigation/TabBar'
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";


export default function ProfileLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center", // Align title to center
      }}
    >
      <Stack.Screen name="profile" options={{ headerShown: false }} />
     
      <Stack.Screen
        name="editing"
        options={{
          headerShown: true,
          title: "Thay đổi hồ sơ",
          headerStyle: {
            backgroundColor:
              Colors[colorScheme ? colorScheme : "light"].background,
          },
          headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
        }}
      />
       
            
      <Stack.Screen name="searchResult"
        options={{
          headerShown: true,
          title: "Kết quả tìm kiếm",
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
      <Stack.Screen name="changePassword"
        options={{
          headerShown: true,
          title: "Đổi mật khẩu",
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
    </Stack>

  );
}
