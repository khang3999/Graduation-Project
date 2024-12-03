import { Foundation, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarStyle: {
          height: 60
        }
      }}>
      <Tabs.Screen
        name="account"
        options={{
          title: 'Người dùng',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={38} name="account-outline" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          title: 'Doanh nghiệp',
          tabBarIcon: ({ color }) => <Foundation size={38} name="torso-business" color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}
