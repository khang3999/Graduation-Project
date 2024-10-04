import React, { useState } from "react";
import { StyleSheet, Image, Switch, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  ButtonComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  TextComponent,
} from "@/components";
import { Lock, Sms } from "iconsax-react-native";
import { appColors } from "@/constants/appColors";
import { View } from "react-native";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }
  };

  return (
    <View>
      <SectionComponent
        styles={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 50,
        }}
      >
        <Image
          source={require("@/assets/images/logo_login.png")}
          style={{ width: 162, height: 165, marginBottom: 0 }}
        />
      </SectionComponent>
      <SectionComponent styles={{ marginTop: 20 }}>
        <TextComponent
          text="Đăng nhập"
          size={24}
          styles={{ fontWeight: "800", margin: 5, marginBottom: 20 }}
        />
        <InputComponent
          value={email}
          placeholder="abc@gmail.com"
          onChange={(val) => setEmail(val)}
          // isPassword
          allowClear
          affix={<Sms size={22} color={appColors.gray2} />}
        />
        <InputComponent
          value={password}
          placeholder="Nhập mật khẩu của bạn"
          onChange={(val) => setPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />
        <RowComponent justify="space-between">
          <RowComponent onPress={() => setIsRemember(!isRemember)}>
            <Switch
              value={isRemember}
              trackColor={{ true: appColors.danger }}
              thumbColor={appColors.white}
              onChange={() => setIsRemember(!isRemember)}
            />
            <TextComponent text="Nhớ tài khoản" styles={{ marginLeft: 5 }} />
          </RowComponent>
          <ButtonComponent
            text="Quên mật khẩu"
            color={appColors.primary}
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
            type="text"
          />
        </RowComponent>
      </SectionComponent>
      <SectionComponent>
        <ButtonComponent
          text="Đăng nhập"
          textStyles={{ fontWeight: "bold", fontSize: 20 }}
          color={appColors.danger}
          type="primary"
          onPress={handleLogin}
        />
      </SectionComponent>
      {/* OR SOCIAL */}
      <SectionComponent>
        <TextComponent
          styles={{ textAlign: "center" }}
          text="Hoặc"
          size={16}
          color={appColors.gray}
        />
        <ButtonComponent
          icon={<Icon name="facebook" size={20} color="blue" />}
          iconFlex="left"
          color="white"
          textColor="blue"
          text="Đăng nhập bằng Facebook"
          styles={{
            margin: 10,
            borderColor: appColors.gray2,
            borderWidth: 0.3,
          }}
        />
        <ButtonComponent
          icon={<Icon name="google" size={20} color="red" />}
          iconFlex="left"
          color="white"
          textColor="red"
          text="Đăng nhập bằng Google"
          styles={{
            margin: 10,
            borderColor: appColors.gray2,
            borderWidth: 0.3,
          }}
        />
      </SectionComponent>
      {/*  */}
      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Bạn chưa có tài khoản? " />
          <ButtonComponent
            text="Đăng kí"
            color={appColors.danger}
            type="link"
            onPress={() => navigation.navigate("RegisterScreen")}
          />
        </RowComponent>
      </SectionComponent>
    </View>
  );
};

const styles = StyleSheet.create({});

export default LoginScreen;
