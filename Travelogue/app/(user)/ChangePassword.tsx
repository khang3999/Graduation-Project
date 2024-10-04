import { ButtonComponent, InputComponent, SectionComponent, TextComponent } from "@/components";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lock } from "iconsax-react-native";
import { appColors } from "@/constants/appColors";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View style={{backgroundColor: 'white', flex: 1 }}>
      
      <SectionComponent styles={{ marginTop: 50}}>
        <TextComponent
          text="Đổi Mật Khẩu"
          size={24}
          styles={{ fontWeight: "800", margin: 5, marginBottom: 20 }}
        />
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
            onPress={()=>{console.log('Change Password')}}
          />
        </SectionComponent>
      </SectionComponent>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ChangePassword;
