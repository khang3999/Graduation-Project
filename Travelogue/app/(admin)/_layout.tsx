import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Image, View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

function CustomDrawerContent(props:any) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Hình ảnh phía trên */}
      <View style={styles.imageContainer}>
        <Image 
<<<<<<< HEAD:Travelogue/app/screens/admin/_layout.tsx
<<<<<<< HEAD
          source={require('@/assets/images/logo.png')} 
=======
          source={require('../../../assets/images/logo.png')} 
>>>>>>> e0e135ad0175f7faa6ec8f30fa266cdee046326a
=======
          source={require('../../assets/images/logo.png')} 
>>>>>>> 1c10ec0ff9f61229c1f01828fbc5e8db9bbfb2d2:Travelogue/app/(admin)/_layout.tsx
          resizeMode="contain" 
          style={styles.image} 
        />
      </View>

      {/* Danh sách các Drawer.Screen */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="(account)" 
          options={{
            drawerLabel: 'Accounts',
            title: 'Accounts',
            drawerIcon: ({color, size}) => (
              <MaterialIcons name="manage-accounts" color={color} size={size} />
            )
          }}
        />
        <Drawer.Screen
          name="(report)" 
          options={{
            drawerLabel: 'Reports',
            title: 'Reports',
            drawerIcon: ({color, size}) => (
              <MaterialIcons name="report" color={color} size={size} />
            )
          }}
        />
        <Drawer.Screen
          name="ban" 
          options={{
            drawerLabel: 'Ban words',
            title: 'Ban words',
            drawerIcon: ({color, size}) => (
              <MaterialIcons name="block" color={color} size={size} />
            )
          }}
        />
        <Drawer.Screen
          name="factor" 
          options={{
            drawerLabel: 'Factor',
            title: 'Factor',
            drawerIcon: ({color, size}) => (
              <Octicons name="number" size={32} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="exchange" 
          options={{
            drawerLabel: 'Exchanges',
            title: 'Exchanges',
            drawerIcon: ({color, size}) => (
              <MaterialIcons name="currency-exchange" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="package" 
          options={{
            drawerLabel: 'Packages',
            title: 'Packages',
            drawerIcon: ({color, size}) => (
              <MaterialCommunityIcons name="package" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="rating" 
          options={{
            drawerLabel: 'Ratings',
            title: 'Rating',
            drawerIcon: ({color, size}) => (
              <MaterialCommunityIcons name="progress-star" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="(information)" 
          options={{
            drawerLabel: 'Information Locations',
            title: 'Information Locations',
            drawerIcon: ({color, size}) => (
              <MaterialCommunityIcons name="information-outline" size={size} color={color} />
            )
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    height: 60,
    width: '100%',
  },
});
``
