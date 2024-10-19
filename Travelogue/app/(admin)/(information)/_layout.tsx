import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      
      <Tabs.Screen
        name="festival"
        options={{
          title: 'Festival',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="festival" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="scenic"
        options={{
          title: 'Scenic',
          tabBarIcon: ({ color }) => <FontAwesome6 name="mountain-sun" size={24} color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
