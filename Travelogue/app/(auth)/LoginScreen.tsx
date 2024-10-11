import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  Switch,
  Alert,
  View,
  ScrollView,
} from "react-native";
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
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig"; 
import FacebookLoginButton from "@/components/socials/facebook";

const LoginScreen =  ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false);

  // if (isRemember) {
  //   await AsyncStorage.setItem('userEmail', email);
  //   await AsyncStorage.setItem('userPassword', password); 
  // }
  // useEffect(() => {
  //   const loadCredentials = async () => {
  //     const savedEmail = await AsyncStorage.getItem('userEmail');
  //     const savedPassword = await AsyncStorage.getItem('userPassword');
  //     if (savedEmail) setEmail(savedEmail);
  //     if (savedPassword) setPassword(savedPassword);
  //   };
  
  //   loadCredentials();
  // }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Hãy nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ. (abc@gmail.com)");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      // Đăng nhập bằng email và mật khẩu
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      router.replace("/(tabs)");

      Alert.alert("Đăng nhập thành công", `Chào mừng ${user.email}`);
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView>
      <SectionComponent
        styles={{
          justifyContent: "center",
          alignItems: "center",
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
        <FacebookLoginButton/>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({});

export default LoginScreen;
