import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="post" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="comment"
        options={{
          title: 'Comment',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comment" color={color} />,
          headerShown:false
        }}
      />
       <Tabs.Screen
        name="postDetail"
        options={{
          title: 'Comment',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comment" color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
