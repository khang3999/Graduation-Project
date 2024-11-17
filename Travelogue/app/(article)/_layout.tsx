import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import ListPoints from '@/components/listPoints/ListPoints';

const Layout = () => {
    const cities = {
        id_country : 'avietnam',
        id_city : 'vn_1',
    }
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
