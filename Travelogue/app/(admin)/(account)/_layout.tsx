import { iconColors } from '@/assets/colors';
import { Foundation, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 60,
        },
        tabBarActiveBackgroundColor: iconColors.green2,
        tabBarActiveTintColor: iconColors.green1,
        tabBarLabelStyle: { fontSize: 14, marginBottom: 5, fontWeight: '500' },
      }}>
      <Tabs.Screen
        name="account"
        options={{
          title: 'Người dùng cá nhân',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={34} name="account-outline" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          title: 'Doanh nghiệp',
          tabBarIcon: ({ color }) => <Octicons name="organization" size={24} color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}
