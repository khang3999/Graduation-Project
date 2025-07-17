import { iconColors } from '@/assets/colors';
import { Entypo, Fontisto, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 60
        },
        tabBarActiveBackgroundColor: iconColors.green2,
        tabBarActiveTintColor: iconColors.green1,
        tabBarLabelStyle: { fontSize: 14, marginBottom: 5, fontWeight: '500' },
      }}>
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <MaterialIcons name="manage-accounts" color={color} size={30} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Bài viết',
          tabBarIcon: ({ color }) => <Entypo size={26} name="news" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="comment"
        options={{
          title: 'Bình luận',
          tabBarIcon: ({ color }) => <Fontisto size={24} name="commenting" color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}
