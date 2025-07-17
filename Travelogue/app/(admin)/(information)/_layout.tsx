import { backgroundColors, iconColors } from '@/assets/colors';
import { Entypo, EvilIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { size } from 'lodash';
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
        name="location"
        options={{
          title: 'Thành phố',
          tabBarIcon: ({ color }) => <FontAwesome6 name="tree-city" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="festival"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="island" size={28} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
