import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'

export default function LiveModeButton(props: any) {
    const type = props.type
    if (type == 0) {
        return <View></View>
    }
    return (
        <>
            {type == 1 ?
                <View style={[styles.container, { backgroundColor: 'red' }]}>
                    <MaterialCommunityIcons name="run-fast" size={22} color='white' />
                    {/* <Ionicons name="footsteps" size={24} color="red" /> */}
                    <Text style={styles.text}>Live</Text>
                </View>
                :
                (<View style={[styles.container, { backgroundColor: 'white' }]}>
                    <FontAwesome6 name="person-circle-check" size={24} color="green" />
                </View>
                )
            }
        </>
    )
}
const styles = StyleSheet.create({
    text: {
        marginLeft: 4,
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 6,
        elevation: 4
        // marginLeft: 10,
    }
})
