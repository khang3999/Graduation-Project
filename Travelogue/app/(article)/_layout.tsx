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
                headerShown: false,
            }}>
            <Stack.Screen name="addPostTour" options={{headerShown: false}}/>
            <Stack.Screen name="addPostUser" options={{headerShown: false}}/>
            <Stack.Screen name="reviewPostUser" options={{headerShown: false}}/>
        </Stack>
       
        </View>
    );
}

const styles = StyleSheet.create({})

export default Layout;
