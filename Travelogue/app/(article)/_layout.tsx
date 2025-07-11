import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import ListPoints from '@/components/listPoints/ListPoints';

const Layout = () => {
    
    return (
        <View style={{flex: 1}}>
          {/* <AddPostUser /> */}
          {/* <AddPostTour/> */}
          <Stack
            screenOptions={{
                headerShown: true,
                headerTitleStyle:{
                    fontWeight: "600",
                    fontSize: 24
                },
                headerTitleAlign:'center'
            }}>
            <Stack.Screen name="addPostTour" options={{title: "Tour mới"}}/>
            <Stack.Screen name="addPostUser" options={{title: "Bài viết mới"}}/>
            <Stack.Screen name="reviewPostUser" options={{title: "Xem trước"}}/>
            <Stack.Screen name="editPostUser" options={{title: "Chỉnh sửa bài viết"}}/>
            <Stack.Screen name="editPostTour" options={{title: "Chỉnh sửa tour"}}/>
            <Stack.Screen name="editPostLive" options={{title: "Chỉnh sửa bài viết"}}/>
            
            
        </Stack>
       
        </View>
    );
}

const styles = StyleSheet.create({})

export default Layout;
