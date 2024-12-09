/// TabBar library
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect } from 'react'
import TabBarTourButton from './TabBarTourButton'

const { width } = Dimensions.get('window');
const switchTabbar = 120

const TabBarTour = ({ state, descriptors, navigation, isTabBarVisible = true }) => {
  // Color
  const focusedColor = '#ea4f4f'
  const greyColor = '#444444'
  if (!isTabBarVisible) return null
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // navigation.navigate(route.name, route.params);
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarTourButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? focusedColor : greyColor}
            label={label}
          />
        )
        // return (
        //   <TouchableOpacity
        //     accessibilityRole="button"
        //     accessibilityState={isFocused ? { selected: true } : {}}
        //     accessibilityLabel={options.tabBarAccessibilityLabel}
        //     testID={options.tabBarTestID}
        //     onPress={onPress}
        //     onLongPress={onLongPress}
        //     style={styles.tabbarItem}
        //   >

        //     {/* Icon */}
        //     {
        //       icons[route.name] ({
        //         color: isFocused ? '#0891b2' : '#737373'
        //       })
        //     }
        //     <Text style={{ color: isFocused ? '#0891b2' : '#737373' }}>
        //       {label}
        //     </Text>
        //   </TouchableOpacity>
        // );
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor:'white',
    flexDirection:'row',
    top: 42,
    // left: '50%',
    alignSelf:'center',
    position: 'absolute',
    width: switchTabbar,
    height: 50,
    borderRadius: 99,
    paddingHorizontal: 10,
    borderWidth:1,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2
  }
})

export default TabBarTour