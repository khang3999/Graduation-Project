/// TabBar library
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import TabBarButton from './TabBarButton'

const TabBar = ({ state, descriptors, navigation }) => {
// Color
const focusedColor = '#0891b2'
const greyColor = '#444444'

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


        if (['_sitemap','+not-found'].includes(route.name)) return null;

        console.log(route.name);
        
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return(
          <TabBarButton
            key={route.name}
            style={styles.tabbarItem}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color= {isFocused ? focusedColor : greyColor}
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
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5
  },
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  }
})

export default TabBar