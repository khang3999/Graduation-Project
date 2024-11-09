import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  Switch,
  Alert,
  View,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
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
import { auth, set, ref, database, onValue } from "@/firebase/firebaseConfig";
import FacebookLoginButton from "@/components/socials/facebook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "@firebase/database";
import Toast from "react-native-toast-message-custom";
import LottieView from "lottie-react-native";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false);
  const [textLoading, setTextLoading] = useState("Đăng nhập");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem("userEmail");
      const savedPassword = await AsyncStorage.getItem("userPassword");
      const savedRemember = await AsyncStorage.getItem("isRemember");

      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      if (savedRemember === "true") setIsRemember(true);
    };

    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (isRemember) {
      AsyncStorage.setItem("userEmail", email);
      AsyncStorage.setItem("userPassword", password);
      AsyncStorage.setItem("isRemember", "true");
    } else {
      AsyncStorage.removeItem("userEmail");
      AsyncStorage.removeItem("userPassword");
      AsyncStorage.removeItem("isRemember");
    }

    if (!email || !password) {
      Alert.alert("Lỗi", "Hãy nhập đầy đủ thông tin đăng nhập.");
      return;
    }
    setLoading(true);
    setTextLoading("Đang đăng nhập...");

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        Alert.alert(
          "Email chưa xác nhận",
          "Vui lòng xác nhận email trước khi đăng nhập."
        );
        setLoading(false);
        setTextLoading("Đăng nhập");
        return;
      }

      const userRef = ref(database, "accounts/" + user.uid);
      const snapshot = await get(userRef);
      const data = snapshot.val();
      // console.log(data);
      if (data) {
        const statusId = data.status_id;
        const role = data.role;
        console.log(statusId);
        if (statusId === "4") {
          Alert.alert(
            "Tài khoản đã bị cấm",
            "Vui lòng liên hệ quản trị viên để biết thêm thông tin.",
            [
              {
                text: "Gọi Tổng Đài",
                onPress: () => Linking.openURL('tel:0384946973'), 
              },
              {
                text: "Gửi email",
                onPress: () => Linking.openURL('mailto:dongochieu333@gmail.com'),
              },
              { text: "Đóng", style: "cancel" } 
            ],
            { cancelable: true } 
          );
        
        } else if (statusId === "1") {
          Alert.alert(
            "Tài khoản chưa được duyệt",
            "Hãy chờ quản trị viên duyệt tài khoản. Mọi sự thắc mắc xin liên hệ quản trị viên.",
            [
              {
                text: "Gọi Tổng Đài",
                onPress: () => Linking.openURL('tel:0384946973'), 
              },
              {
                text: "Gửi email",
                onPress: () => Linking.openURL('mailto:dongochieu333@gmail.com'),
              },
              { text: "Đóng", style: "cancel" } 
            ],
            { cancelable: true } 
          );
        } else if (statusId === "2") {
          Toast.show({
            type: "success",
            text1: "Đăng nhập thành công",
            text2: `Chào mừng ${data.fullname}`,
            // visibilityTime: 3000,
          });
          if (role=== "admin"){
            router.replace('/(admin)/(account)/account')
          }
          else if (role === "user"){
            router.replace("/(tabs)");
          }
          else {
            console.log("Day la trang doanh ngh");
          }
          
        }
      }
      const userId = userCredential.user.uid;
      await AsyncStorage.setItem("userToken", userId);
      
      // const storedUserId = await AsyncStorage.getItem("userToken");  
      // console.log(storedUserId);

      setLoading(false);
      setTextLoading("Đăng nhập");
    } catch (error) {
      setLoading(false);
      setTextLoading("Đăng nhập");
      Alert.alert(
        "Đăng nhập thất bại",
        "Email hoặc mật khẩu không đúng. Vui lòng thử lại."
      );
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
            onPress={() =>
              navigation.navigate("ForgotPasswordScreen", { email: email })
            }
            type="text"
          />
        </RowComponent>
      </SectionComponent>
      <SectionComponent>
        <ButtonComponent
          text={textLoading}
          textStyles={{ fontWeight: "bold", fontSize: 20 }}
          color={appColors.danger}
          type="primary"
          onPress={handleLogin}
        />
      </SectionComponent>
      {/* OR SOCIAL */}
      {/* <SectionComponent>
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
      </SectionComponent> */}
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
      {loading && (
        <Modal transparent={true} animationType="none" visible={loading}>
          <View style={styles.loadingOverlay}>
          <LottieView
            source={require("../../assets/images/login.json")}
            autoPlay
            loop
            style={{
              position: "absolute",
              top: 190,
              // top: -190,
              // left: -120,
              // zIndex: -10,
              width: 650,
              height: 320,
            }}
          />
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default LoginScreen;
