import React, { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppProvider from "../contexts/AppProvider";
import Toast from "react-native-toast-message-custom";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFonts, NotoSans_300Light_Italic, NotoSans_400Regular_Italic, NotoSans_400Regular, NotoSans_500Medium, NotoSans_600SemiBold, NotoSans_700Bold } from '@expo-google-fonts/noto-sans';
import { DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { SplashScreen } from "expo-router";

// Giữ màn hình Splash hiển thị cho đến khi tài nguyên được tải xong
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  let [fontsLoaded] = useFonts({
    NotoSans_300Light_Italic,
    NotoSans_400Regular,
    NotoSans_400Regular_Italic,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Ẩn màn hình Splash khi font đã được tải
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Chờ cho font tải xong
  }

  return (
    <AppProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
