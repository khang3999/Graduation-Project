import { View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import { router, Tabs } from 'expo-router'
import { useRanking } from '@/contexts/RankingContext';
import { AntDesign, Entypo, FontAwesome6, Fontisto, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { iconColors } from '@/assets/colors';
import Toast from 'react-native-toast-message-custom';

const _layout = () => {
  const { refreshTrendingAll } = useRanking();
  const currentMonth = new Date().getMonth() + 1; // Tháng hiện tại (1 - 12)
  const title = `Top trending tháng ${currentMonth}`;

  const handleRefeshTrending = useCallback(async () => {
    await refreshTrendingAll()

    //Khi xong thì show toast
    Toast.show({
      type: 'success',
      text1: 'Cập nhật thành công',
      text2: 'Bảng xếp hạng đã được làm mới',
      position: 'top',
    });
  }, [refreshTrendingAll])
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleRefeshTrending}
            style={{ backgroundColor: iconColors.green1, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
          >
            <AntDesign name="reload1" size={22} color='white' />
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={() =>
            router.replace('/(tabs)')}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
        headerStyle: {
          elevation: 6
        },
        headerRightContainerStyle: { paddingRight: 20 },
        headerLeftContainerStyle: { paddingLeft: 20 },
        headerTitle: title,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 25, fontWeight: "bold" },

        tabBarStyle: { backgroundColor: iconColors.green2, padding: 0, margin: 0, height: 60 },
        tabBarLabelStyle: { fontSize: 16, alignItems: 'center', fontWeight: '500', justifyContent: 'center', },
        tabBarInactiveBackgroundColor: 'white',
        tabBarActiveBackgroundColor: iconColors.green2,
        tabBarActiveTintColor: iconColors.green1,
        tabBarItemStyle: { height: '86%', alignItems: 'center', justifyContent: 'center' },
        tabBarLabelPosition: 'beside-icon'
      }}
    >
      <Tabs.Screen
        name="cityTrending"
        options={{
          title: 'Tỉnh thành',
          tabBarIcon: ({ color }) => <FontAwesome6 name="tree-city" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="postTrending"
        options={{
          title: 'Bài viết',
          tabBarIcon: ({ color }) => <Entypo size={24} name="news" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tourTrending"
        options={{
          title: 'Tour du lịch',
          tabBarIcon: ({ color }) => <Fontisto name="bus-ticket" size={24} color={color} />,
        }}
      />


    </Tabs >
  )
}

export default _layout