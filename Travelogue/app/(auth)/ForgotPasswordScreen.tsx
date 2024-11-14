import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import {
  fetchSignInMethodsForEmail,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, set } from "@/firebase/firebaseConfig";

const ForgotPasswordScreen = ({ navigation, route }: any) => {
  const requestemail = route.params?.email || "";
  // console.log (requestemail);
  const [email, setEmail] = useState(requestemail);
  const [loading, setLoading] = useState(false);
  const [textLoading, setTextLoading] = useState("Gửi yêu cầu");

  const handleResetPassword = async () => {
    setLoading(true);
    setTextLoading("Đang gửi...");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoading(false);
      setTextLoading("Gửi yêu cầu");
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ. (abc@gmail.com)");
      return;
    }
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        setLoading(false);
        setTextLoading("Gửi yêu cầu");
        Alert.alert("Thành công", "Email đặt lại mật khẩu đã được gửi");
        navigation.navigate("LoginScreen");
      })
      .catch((error) => {
        setLoading(false);
        setTextLoading("Gửi yêu cầu");
        Alert.alert("Lỗi", "Email chưa được đăng ký");
      });
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
          text={textLoading}
          color={appColors.danger}
          onPress={handleResetPassword}
        />
      </SectionComponent>
      {loading && (
        <Modal transparent={true} animationType="none" visible={loading}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={appColors.danger} />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: appColors.white,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default ForgotPasswordScreen;
