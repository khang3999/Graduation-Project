import { Entypo, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', tabBarStyle:{
      height:60
    }  }}>
      <Tabs.Screen
        name="account"
        options={{
          title: 'Người dùng',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={38} name="account-outline" color={color} />,
          headerShown:false
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Bài viết',
          tabBarIcon: ({ color }) => <Entypo size={30} name="news" color={color} />,

          headerShown:false
        }}
      />
       <Tabs.Screen
        name="comment"
        options={{
          title: 'Bình luận',
          tabBarIcon: ({ color }) => <Fontisto size={28} name="commenting" color={color} />,

          headerShown:false
        }}
      />
    </Tabs>
  );
}
