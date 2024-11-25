/// TabBar library
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import TabBarButton from './TabBarButton'

const TabBar = ({ state, descriptors, navigation, isTabBarVisible = true, role }) => {
  // Color
  const focusedColor = '#0891b2'
  const greyColor = '#444444'
  if (!isTabBarVisible) return null
  useEffect(() => {
    console.log("Role in TabBar:", role);
  }, [role]);

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        // Kiểm tra role để ẩn các tab theo yêu cầu
        if (role === 'user' && route.name === 'payment') return null;
        if (role === 'business' && route.name === '(maps)') return null;
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
          <TabBarButton
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
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: '#f1f1f1',
  },
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  }
})

export default TabBar