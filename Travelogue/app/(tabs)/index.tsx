import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import HeaderIndex from "@/components/header/HeaderIndex";
import ActionBar from "@/components/ActionBar";
import { router } from "expo-router";
import { ButtonComponent } from "@/components";
import { appColors } from "@/constants/appColors";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

console.log("App is running from (tabs)/index.tsx");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Đăng xuất thành công", "Bạn đã đăng xuất khỏi tài khoản.");
      router.replace("/LoginScreen"); 
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };
const Home = () => {
  return (
    <View>
      <HeaderIndex></HeaderIndex>
      <Text>Home</Text>
      <ActionBar></ActionBar>
      <TouchableOpacity
        onPress={() => {
          router.push("/(admin)/(account)/account");
        }}
      >
        <Text>admin</Text>
      </TouchableOpacity>
      <ButtonComponent
        text="Đăng xuất"
        color={appColors.danger}
        onPress={handleLogout}
      />
    </View>
  );
};

export default Home;
