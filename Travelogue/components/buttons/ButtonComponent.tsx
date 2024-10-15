import React, { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import TextComponent from '../TextComponent';
import { globalStyle } from '../../styles/globalStyles';
import { appColors } from '../../constants/appColors';

interface Props {
  icon?: ReactNode;
  text: string;
  type?: 'primary' | 'text' | 'link';
  color?: string;
  styles?: StyleProp<ViewStyle>;
  textColor?: string;
  textStyles?: StyleProp<TextStyle>;
  onPress?: () => void;
  iconFlex?: 'right' | 'left';
  disabled?: boolean;
}

const ButtonComponent = (props: Props) => {
  const { 
    icon, 
    text, 
    type = 'primary', 
    textColor, 
    textStyles, 
    color, 
    styles, 
    onPress, 
    iconFlex = 'left', 
    disabled = false
  } = props;

  const renderIcon = () => {
    return icon ? (
      <View style={iconFlex === 'right' ? stylesRightIcon : stylesLeftIcon}>
        {icon}
      </View>
    ) : null;
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const buttonStyle = [
    globalStyle.button,
    globalStyle.shadow,
    {
      backgroundColor: disabled ? appColors.disabled : color ?? appColors.danger,
    },
    styles,
  ];

  const textColorToUse = disabled ? appColors.disabledText : textColor ?? appColors.white;

  return type === 'primary' ? (
    <TouchableOpacity
      onPress={handlePress}
      style={buttonStyle}
      disabled={disabled} 
    >
      {iconFlex === 'left' && renderIcon()}
      <TextComponent
        text={text}
        color={textColorToUse}
        styles={[
          textStyles,
          {
            marginLeft: icon && iconFlex === 'left' ? 12 : 0,
            marginRight: icon && iconFlex === 'right' ? 12 : 0,
            fontSize: 16,
            fontWeight: 'bold',
          },
        ]}
      />
      {iconFlex === 'right' && renderIcon()}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <TextComponent
        text={text}
        color={disabled ? appColors.disabledText : (type === 'link' ? appColors.link : appColors.text)}
      />
    </TouchableOpacity>
  );
};

const stylesRightIcon = {
  marginLeft: 12,
};

const stylesLeftIcon = {
  marginRight: 12,
};

export default ButtonComponent;
