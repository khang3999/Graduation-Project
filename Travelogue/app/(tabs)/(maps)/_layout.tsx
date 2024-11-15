import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBarButton from '@/components/navigation/TabBarButton'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { Entypo, FontAwesome } from '@expo/vector-icons'

const { width } = Dimensions.get('window');
const switchTabbar = 120

const MapLayout = () => {
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarStyle: styles.tabBar,
                    headerStyle: {
                        height: 105,
                        backgroundColor:'#ff5b5b',
                        borderRadius: 20,
                        elevation: 10
                    },
                    // headerTitle: (props) =>
                    //     // Bỏ image vào đây
                    //     <Image
                    //         source={require('@/assets/images/logo.png')}
                    //         resizeMode="contain"
                    //     />
                    // ,
                }}
            >
                <Tabs.Screen
                    key={1}
                    name="checkInMap"
                    options={{
                        title: 'Check in',
                        tabBarShowLabel: false,
                        tabBarIcon: ({ color }) => <Entypo name="location" size={22} color="black" />,
                    }} />
                <Tabs.Screen
                    key={2}
                    name="realMap"
                    options={{
                        title: 'Real Map',
                        tabBarShowLabel: false,
                        tabBarIcon: ({ color }) => <FontAwesome name="map-signs" size={24} color="black" />,
                    }} />
            </Tabs >
        </>

    )
}

const styles = StyleSheet.create({
    tabBar: {
        top: 45,
        left: width - switchTabbar,
        position: 'absolute',
        width: switchTabbar,
        height: 40,
        borderTopLeftRadius: 99,
        borderBottomLeftRadius: 99,
        paddingHorizontal: 10,
    }
})

export default MapLayout