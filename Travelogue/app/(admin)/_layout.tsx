import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Image, View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons, Octicons, Entypo, AntDesign, FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { signOut } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';
import { iconColors } from '@/assets/colors';

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
      <TouchableOpacity
        style={{ backgroundColor: '#D10000', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 20, paddingVertical: 10, borderRadius: 15, gap: 10 }}
        onPress={handleLogout}>
        <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', marginRight: 0 }}>Đăng xuất</Text>
        <MaterialIcons name="logout" size={22} color="white" />
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
          headerShown: true,
          drawerType: 'back',
          drawerActiveTintColor: iconColors.green1,
        }}
      >
        <Drawer.Screen
          name="(account)"
          options={{
            drawerLabel: 'Tài khoản',
            title: 'Tài khoản',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialIcons name="manage-accounts" color={color} size={size} />
              </View>
            ),

          }}
        />
        <Drawer.Screen
          name="(report)"
          options={{
            drawerLabel: 'Báo cáo vi phạm',
            title: 'Báo cáo vi phạm',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialIcons name="report" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Drawer.Screen
          name="ban"
          options={{
            drawerLabel: 'Từ cấm',
            title: 'Từ cấm',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialIcons name="block" color={color} size={size} />
              </View>
            )
          }}
        />
        <Drawer.Screen
          name="factorA"
          options={{
            drawerLabel: ' Hệ số',
            title: 'Hệ số',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <Octicons name="number" size={28} color={color} />
              </View>
            )
          }}
        />
        <Drawer.Screen
          name="(reason)"
          options={{
            drawerLabel: 'Lí do vi phạm',
            title: 'Lí do vi phạm',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <Entypo name="list" size={size} color={color} />
              </View>
            )
          }}
        />
        <Drawer.Screen
          name="exchange"
          options={{
            drawerLabel: 'Quản lý nạp tiền',
            title: 'Quản lý nạp tiền',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialIcons name="currency-exchange" size={size} color={color} />
              </View>
            )
          }}
        />
        <Drawer.Screen
          name="package"
          options={{
            drawerLabel: '  Gói bài đăng',
            title: 'Gói bài đăng doanh nghiệp',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <FontAwesome6 name="file-invoice-dollar" size={size} color={color} />
              </View>
            )
          }}

        />

        <Drawer.Screen
          name="(information)"
          options={{
            drawerLabel: 'Cập nhật thủ công',
            title: 'Thông tin',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialCommunityIcons name="content-save-edit-outline" size={size} color={color} />
              </View>
            )
          }}
        />
        <Drawer.Screen
          name="scrape"
          options={{
            drawerLabel: 'Cập nhật tự động',
            title: 'Cập nhật thông tin',
            drawerIcon: ({ color, size }) => (
              <View style={{ marginRight: 5 }}>
                <MaterialIcons name="browser-updated" size={size} color={color} />
              </View>
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
