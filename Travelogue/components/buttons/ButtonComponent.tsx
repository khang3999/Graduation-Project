import React, {ReactNode} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import TextComponent from '../TextComponent';
import {globalStyle} from '../../styles/globalStyles';
import {appColors} from '../../constants/appColors';

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
}

const ButtonComponent = (props: Props) => {
  const {icon, text, type = 'primary', textColor, textStyles, color, styles, onPress, iconFlex = 'left'} = props;
  
  const renderIcon = () => {
    return icon ? (
      <View style={iconFlex === 'right' ? stylesRightIcon : stylesLeftIcon}>
        {icon}
      </View>
    ) : null;
  };

  return type === 'primary' ? (
    <TouchableOpacity
      onPress={onPress}
      style={[
        globalStyle.button,
        globalStyle.shadow,
        {
          backgroundColor: color ?? appColors.danger,
        },
        styles,
      ]}>
      {iconFlex === 'left' && renderIcon()}
      <TextComponent
        text={text}
        color={textColor ?? appColors.white}
        styles={[
          textStyles,
          {
            marginLeft: icon && iconFlex === 'left' ? 12 : 0,
            marginRight: icon && iconFlex === 'right' ? 12 : 0,
            fontSize: 16,
            fontWeight: 'bold'
          },
        ]}
      />
      {iconFlex === 'right' && renderIcon()}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={onPress}>
      <TextComponent
        text={text}
        color={type === 'link' ? appColors.link : appColors.text}
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
