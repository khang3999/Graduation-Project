import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBarTour from '@/components/navigationBarTour/TabBarTour'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { Entypo, FontAwesome } from '@expo/vector-icons'
import TabBar from '@/components/navigation/TabBar'

const { width } = Dimensions.get('window');
const switchTabbar = 120

const MapLayout = () => {
    return (
        <Tabs
            tabBar={(props: any) => <TabBarTour {...props} />}
            screenOptions={{
                tabBarStyle: styles.tabBar,
                headerStyle: {
                    height: 105,
                    backgroundColor: '#ff5b5b',
                    borderRadius: 20,
                    elevation: 10
                },
                headerTitle: 'Bản đồ',
            }}
        >
            <Tabs.Screen
                key={1}
                name="checkInMap"
                options={{
                    title: 'Check in',
                    headerTitle: 'Bản đồ',
                    headerRight: () => <Text style={styles.headerTitleText}>Check in</Text>,
                }} />
            <Tabs.Screen
                key={2}
                name="realMap"
                options={{
                    title: 'Real Map',
                    headerTitle: 'Danh lam',
                    headerRight: () => <Text style={styles.headerTitleText}>Lễ hội</Text>,
                }} />
        </Tabs >

    )
}

const styles = StyleSheet.create({
    tabBar: {
        top: 45,
        left: width - switchTabbar,
        position: 'absolute',
        width: switchTabbar,
        borderTopLeftRadius: 99,
        borderBottomLeftRadius: 99,
        paddingHorizontal: 10,
    },
    headerTitleText: {
        marginHorizontal: 20,
        fontSize: 20,
        fontWeight: '500'
    }
})

export default MapLayout