import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Image, View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons, Octicons, Entypo, AntDesign } from '@expo/vector-icons';
import React from 'react';
import { signOut } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';

function CustomDrawerContent(props: any) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      Alert.alert("Đăng xuất thành công", "Bạn đã đăng xuất khỏi tài khoản.");
      router.replace("/LoginScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };
  return (
    <DrawerContentScrollView {...props}>
      {/* Hình ảnh phía trên */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          resizeMode="contain"
          style={styles.image}
        />
      </View>

      {/* Danh sách các Drawer.Screen */}
      <DrawerItemList {...props} />
      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: 'red', fontSize: 30, textAlign: 'center', marginTop: 40 }}>Đăng xuất</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true
        }}
      >
        <Drawer.Screen
          name="(account)"
          options={{
            drawerLabel: 'Tài khoản',
            title: 'Tài khoản',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="manage-accounts" color={color} size={size} />
            )
          }}
        />
        <Drawer.Screen
          name="(report)"
          options={{
            drawerLabel: 'Báo cáo',
            title: 'Báo cáo',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="report" color={color} size={size} />
            ),

          }}
        />
        <Drawer.Screen
          name="ban"
          options={{
            drawerLabel: 'Từ cấm',
            title: 'Từ cấm',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="block" color={color} size={size} />
            )
          }}
        />
        <Drawer.Screen
          name="factorA"
          options={{
            drawerLabel: 'Hệ số',
            title: 'Hệ số',
            drawerIcon: ({ color, size }) => (
              <Octicons name="number" size={32} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="(reason)"
          options={{
            drawerLabel: 'Lí do báo cáo',
            title: 'Lí do báo cáo',
            drawerIcon: ({ color, size }) => (
              <Entypo name="list" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="exchange"
          options={{
            drawerLabel: 'Giao dịch',
            title: 'Giao dịch',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="currency-exchange" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="package"
          options={{
            drawerLabel: 'Gói doanh nghiệp',
            title: 'Gói doanh nghiệp',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="package" size={size} color={color} />
            )
          }}

        />

        <Drawer.Screen
          name="(information)"
          options={{
            drawerLabel: 'Thông tin địa điểm',
            title: 'Thông tin địa điểm',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="information-outline" size={size} color={color} />
            )
          }}
        />
        <Drawer.Screen
          name="scrape"
          options={{
            drawerLabel: 'Scrape',
            title: 'Scrape',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="information-outline" size={size} color={color} />
            )
          }}
        /><Drawer.Screen
        name="reset"
        options={{
          drawerLabel: 'Reset',
          title: 'Reset',
          drawerIcon: ({ color, size }) => (
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
