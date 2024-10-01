import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { appColors } from '../constants/appColors';
import { globalStyle } from '../styles/globalStyles';

interface Props {
    text: string;
    color?: string;
    size?: number;
    flex?: number;
    styles?: StyleProp<TextStyle>;
    title?: boolean;
}

const TextComponent = (props: Props) => {
    const { text, size, flex, color, styles , title} = props;

    return (
        <Text
            style={[
                globalStyle.text,
                {
                    color: color ?? appColors.text,
                    flex: flex ?? 0,
                    fontSize: size ? size : title ? 24 : 14,
                },
                styles
            ]}
        >
            {text}
        </Text>
    );
};

const styles = StyleSheet.create({});

export default TextComponent;
