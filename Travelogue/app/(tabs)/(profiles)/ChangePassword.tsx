import { ButtonComponent, InputComponent, SectionComponent, TextComponent } from "@/components";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Lock } from "iconsax-react-native";
import { appColors } from "@/constants/appColors";
import { router } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, User } from "@firebase/auth";
import { useAccount } from "@/contexts/AccountProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePassword = () => {
  const {accountData} = useAccount();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleResetPassword = async () => {
    // console.log('Đổi mật khẩu')
    if (password === '' || newPassword === '' || confirmPassword === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không trùng khớp');
      return
    }
    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return
    }
    if(password === newPassword) {
      Alert.alert('Thông báo', 'Mật khẩu mới không được trùng với mật khẩu cũ');
      return
    }
    
    
  try {
    const userString = await AsyncStorage.getItem("user");
    let user;
    if (userString) {
      user = JSON.parse(userString);
      console.log(user.email);
      
    } else {
      throw new Error('User not found');
    }
  
  if (user && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    
    
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      console.log('Đổi mật khẩu Success');
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      console.log(error);
      Alert.alert('Thông báo', 'Mật khẩu cũ không đúng');
      return;
    }
  } else {
    console.log('User not found');
  }
} catch (error) {
  // console.log('Error updating password:', error.message);
}

   
  }

  return (
    <View style={{backgroundColor: 'white',flex: 1}}>
      <SectionComponent styles={styles.container}>        
        <InputComponent
          value={password}
          placeholder="Nhập mật khẩu cũ"
          onChange={(val) => setPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />
        <InputComponent
          value={newPassword}
          placeholder="Nhập mật khẩu mới"
          onChange={(val) => setNewPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />
        <InputComponent
          value={confirmPassword}
          placeholder="Nhập xác nhận lại mật khẩu mới"
          onChange={(val) => setConfirmPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />
        <SectionComponent>
          <ButtonComponent
            text="Đổi mật khẩu"
            textStyles={{ fontWeight: "bold", fontSize: 20 }}
            color={appColors.danger}
            type="primary"
            onPress={handleResetPassword}
          />
        </SectionComponent>
      </SectionComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    paddingHorizontal:24,
    paddingTop:50
  }
});

export default ChangePassword;