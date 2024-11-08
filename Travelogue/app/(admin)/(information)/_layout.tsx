import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="festival"
        options={{
          title: 'Festival',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="group" color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
