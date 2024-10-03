import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import RegisterScreen from "@/app/screen/auth/RegisterScreen";
import RouterAuth from "@/app/screen/auth/RouterAuth";
import ChangePassword from "@/app/screen/user/ChangePassword";
import { MapScreen } from "@/app/(tabs)/MapScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Tab = createBottomTabNavigator();

const _layout = () => {
  return (

    <>
      <Tabs
        tabBar={props => <TabBar {...props} />}
      >
        <Tabs.Screen
          key={1}
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }} />
        <Tabs.Screen
          key={2}
          name="tour"
          options={{
            title: 'Tour',
            headerShown: false,
          }} />
        <Tabs.Screen
          key={3}
          name="map"
          options={{
            title: 'Map',
            headerShown: false,
          }} />
        <Tabs.Screen
          key={4}
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
          }} />

      </Tabs>
    </>

  )
}

export default _layout