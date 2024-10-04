import { View, Text, StyleSheet, StatusBar, FlatList } from "react-native";
import React from "react";
import NotificationItem from "@/components/notification/NotificationItem";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
import { SafeAreaView } from "react-native-safe-area-context";


const DATA = [
 {
  id: "1",
  title: "Alice liked your photo",
  date: "2023-10-04",
},
{
  id: "2",
  title: "Bob commented on your post",
  date: "2023-10-05",
},
{
  id: "3",
  title: "Charlie started following you",
  date: "2023-10-06",
},
{
  id: "4",
  title: "Dave mentioned you in a comment",
  date: "2023-10-07",
},
{
  id: "5",
  title: "Eve shared your post",
  date: "2023-10-08",
},
{
  id: "6",
  title: "Frank sent you a friend request",
  date: "2023-10-09",
},
{
  id: "7",
  title: "Grace tagged you in a photo",
  date: "2023-10-10",
},
{
  id: "8",
  title: "Hank invited you to an event",
  date: "2023-10-11",
},
{
  id: "9",
  title: "Ivy sent you a message",
  date: "2023-10-12",
},
{
  id: "10",
  title: "Jack liked your comment",
  date: "2023-10-13",
}
];



export default function NotificationScreen() {
  return (
       <SafeAreaView>
      <FlatList
        data={DATA}
        renderItem={({ item }) => <NotificationItem title={item.title} image={require('@/assets/images/tom.png')} time={item.date}></NotificationItem>}
        keyExtractor={(item) => item.id}
      ></FlatList>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,  
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,        
  },
  title: {
    fontSize: 32,
  },
});
