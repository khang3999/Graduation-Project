import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="scenic"
        options={{
          title: 'Scenic spots',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="picture-o" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="festival"
        options={{
          title: 'Festival',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="festival" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="place"
        options={{
          title: 'Place',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="place" color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
