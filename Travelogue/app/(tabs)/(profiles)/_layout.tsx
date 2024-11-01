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
      <Stack.Screen name="Profile" options={{ headerShown: false }} />      
      <Stack.Screen
        name="notification"
        options={{
          headerShown: true,
          title: "Notifications",
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
      <Stack.Screen
        name="Editing"
        options={{
          headerShown: true,
          title: "Edit Profile",
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
        <Stack.Screen
        name="Post"
        options={{
          headerShown: true,
          title: "Posts",
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
      <Stack.Screen name="SearchResult" 
       options={{
        headerShown: true,
        title: "Search Result",
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
       <Stack.Screen name="ChangePassword" 
       options={{
        headerShown: true,
        title: "Change Password",
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
    
  );
}
