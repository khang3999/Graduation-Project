import { ButtonComponent, InputComponent, SectionComponent } from "@/components";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Lock } from "iconsax-react-native";
import { appColors } from "@/constants/appColors";
import { router } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "@firebase/auth";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (password === '' || newPassword === '' || confirmPassword === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không trùng khớp');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (password === newPassword) {
      Alert.alert('Thông báo', 'Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);

        try {
          // Xác thực lại với tài khoản hiện tại
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, newPassword);
          Alert.alert('Thông báo', 'Đổi mật khẩu thành công');
          router.replace('/(auth)/LoginScreen');
        } catch (error) {
          // console.error(error);
          Alert.alert('Thông báo', 'Mật khẩu cũ không đúng');
        }
      } else {
        console.log('No authenticated user found');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating password:', error.message);
      } else {
        console.error('Error updating password:', error);
      }
    }
  };

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 50,
  },
});

export default ChangePassword;
