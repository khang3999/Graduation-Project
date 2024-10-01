import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
    width?: number;
    height?: number;
}
const SpaceComponent = (props : Props) => {
    const {width, height} = props;
    return (
        <View
         style={{
            width,
            height
         }}
        >
        </View>
    );
}

const styles = StyleSheet.create({})

export default SpaceComponent;
