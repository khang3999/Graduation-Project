import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBarButton from '@/components/navigation/TabBarButton'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { FontAwesome } from '@expo/vector-icons'

const { width } = Dimensions.get('window');
const switchTabbar = 120

const MapLayout = () => {
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarStyle: styles.tabBar,
                    headerStyle: {
                        height: 105
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
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                    }} />
                <Tabs.Screen
                    key={2}
                    name="realMap"
                    options={{
                        title: 'Real Map',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                    }} />
            </Tabs >
        </>

    )
}

const styles = StyleSheet.create({
    tabBar: {
        top: 50,
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