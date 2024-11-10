import React from 'react';
import { StyleSheet, View } from 'react-native';
import AddPostUser from './addPostUser';
import AddPostTour from './addPostTour';
import { Stack } from 'expo-router';

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
