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


export default function HomeLayout() {
    const colorScheme = useColorScheme();

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="post" options={{ headerShown: false }} />
        </Stack>

    );
}
