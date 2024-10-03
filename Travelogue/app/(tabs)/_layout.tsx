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

  return (
    // <Tabs
    //   screenOptions={{
    //     tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    //     headerShown: false,
    //   }}>
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: 'Home',
    //       tabBarIcon: ({ color, focused }) => (
    //         <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="explore"
    //     options={{
    //       title: 'Explore',
    //       tabBarIcon: ({ color, focused }) => (
    //         <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
    //       ),
    //     }}
    //   />
    // </Tabs>
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Map" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
