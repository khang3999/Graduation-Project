import React, { useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { createStackNavigator, Header } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppProvider from "../contexts/AppProvider";
import Toast from "react-native-toast-message-custom";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Font from 'expo-font';

export default function Layout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'DancingScript': require('@/assets/fonts/DancingScript.ttf'),
        'FuzzyBold': require('@/assets/fonts/FuzzyBubbles-Bold.ttf'),
        'Fuzzy': require('@/assets/fonts/FuzzyBubbles-Regular.ttf'),
        'Mali': require('@/assets/fonts/Mali-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);
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
          <Stack.Screen name="notify" options={{
            headerShown: true,
            title: "Thông báo",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            }
          }} />
          <Stack.Screen name="newPoint" options={{ headerShown: true, title: "Địa điểm mới" }} />
          <Stack.Screen name="imageReport" options={{
            headerShown: true,
            title: "Hình ảnh minh chứng",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="accountDetail" options={{
            headerShown: true,
            title: "Chi tiết tài khoản",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="companyDetail" options={{
            headerShown: true,
            title: "Chi tiết doanh nghiệp",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="userDetail" options={{
            headerShown: true,
            title: "Chi tiết tài khoản cá nhân",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="postDetail" options={{
            headerShown: true,
            title: "Bài viết",
            headerStyle: {
              backgroundColor:
                Colors[colorScheme ? colorScheme : "light"].background,
            },
            headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 24
            },
            headerTitleAlign: "center",
          }} />
          <Stack.Screen name="tourDetail"
            options={{
              headerShown: true,
              title: "Tour du lịch",
              headerStyle: {
                backgroundColor:
                  Colors[colorScheme ? colorScheme : "light"].background,
              },
              headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
              headerTitleStyle: {
                fontWeight: "600",
                fontSize: 24
              },
              headerTitleAlign: "center",
            }} />
          <Stack.Screen name="gallery"
            options={{
              headerShown: true,
              title: "Khám phá",
              headerStyle: {
                backgroundColor:
                  Colors[colorScheme ? colorScheme : "light"].background,
              },
              headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
              headerTitleStyle: {
                fontWeight: "600",
                fontSize: 24
              },
              headerTitleAlign: "center",
            }} />
          <Stack.Screen name="SearchResult"
            options={{
              headerShown: true,
              title: "Kết quả tìm kiếm",
              headerStyle: {
                backgroundColor:
                  Colors[colorScheme ? colorScheme : "light"].background,
              },
              headerTintColor: Colors[colorScheme ? colorScheme : "light"].text,
              headerTitleStyle: {
                fontWeight: "600",
                fontSize: 24
              },
              headerTitleAlign: "center",
            }} />
        </Stack>
        <Toast />

      </GestureHandlerRootView>
    </AppProvider>
  );
}
