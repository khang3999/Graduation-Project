import { Entypo, EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', tabBarStyle:{
      height:60
    }  }}>
      <Tabs.Screen
        name="location"
        options={{
          title: 'Thành phố',
          tabBarIcon: ({ color }) => <Entypo size={28} name="location" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="festival"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="party-popper" size={28} color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
