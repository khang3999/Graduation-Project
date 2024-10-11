import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  ButtonComponent,
  InputComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from "@/components";
import { ArrowLeft, Sms } from "iconsax-react-native";
import { appColors } from "@/constants/appColors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fetchSignInMethodsForEmail, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const ForgotPasswordScreen = ({ navigation, route }: any) => {
  const requestemail = route.params?.email || "";
  // console.log (requestemail);
  const [email, setEmail] = useState(requestemail);

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ. (abc@gmail.com)");
      return;
    }
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        Alert.alert("Lỗi", "Email chua duoc dang ky.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Thành công", "Email đặt lại mật khẩu đã được gửi");
      navigation.navigate("LoginScreen");
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };
  return (
    <View style={styles.container}>
      <SectionComponent>
        <ArrowLeft
          size="32"
          style={{ marginBottom: -10 }}
          onPress={() => {
            navigation.navigate("LoginScreen");
          }}
          color="#000"
        />
      </SectionComponent>
      <SectionComponent>
        <TextComponent
          text="Quên mật khẩu"
          size={24}
          styles={{ fontWeight: "800" }}
        />
        <SpaceComponent height={10} />
        <TextComponent
          text="Hãy nhập địa chỉ tài khoản gmail để yêu cầu đổi mật khẩu"
          size={14}
        />
        <SpaceComponent height={20} />
        <InputComponent
          value={email}
          placeholder="abc@email.com"
          onChange={(val) => setEmail(val)}
          // isPassword
          allowClear
          affix={<Sms size={22} color={appColors.gray2} />}
        />
        <ButtonComponent
          textStyles={{ fontWeight: "semibold", fontSize: 20 }}
          text="GỬI YÊU CẦU"
          color={appColors.danger}
          onPress={handleResetPassword}
        />
      </SectionComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
});

export default ForgotPasswordScreen;
