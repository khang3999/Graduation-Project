import {
  ButtonComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  TextComponent,
} from "@/components";
import { appColors } from "@/constants/appColors";
import {
  Profile,
  Sms,
  Lock,
  CallCalling,
  Bank,
  ArrowLeft,
  Bookmark,
  Camera,
  Gallery,
} from "iconsax-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import ImagePickerComponent from "@/components/images/ImagePickerComponent";
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { UserRegister } from "@/model/UserRegister";

const RegisterScreen = ({ navigation }: any) => {
  // Thanh chuyển tab
  const [activeTab, setActiveTab] = useState("user");
  // Thông tin đăng ký
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tax, setTax] = useState("");
  // Lưu ảnh
  const [frontCCCDImage, setFrontCCCDImage] = useState<string | null>(null);
  const [backCCCDImage, setBackCCCDImage] = useState<string | null>(null);
  const [businessLicenseImage, setBusinessLicenseImage] = useState<string | null>(null);
  
  // Xử lý đăng ký
const onRegisterUser = async () => {
  try {
    if (activeTab === "user") {
      if (!name || !email || !phone || !password || !confirmPassword) {
        Alert.alert("Lỗi", "Bạn cần nhập đủ thông tin.");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp với mật khẩu bạn tạo.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ (abc@gmail.com).");
        return;
      }

      const phoneRegex = /^[0-9]{10,12}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ (10-12 số).");
        return;
      }

     //Tạo auth
     const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    if (user) {
      // Tạo đối tượng User mới
      const currentDate = new Date().toLocaleDateString(); 
      const newUser = new UserRegister(name, email, phone ,password, currentDate);

      // Lưu thông tin người dùng vào Firebase Realtime Database
      await database()
        .ref(`/users/${user.uid}`)
        .set({
          fullname: newUser.fullname,
          email: newUser.email,
          createdAt: newUser.createdAt,
        });


      Alert.alert("Thành công", "Đăng ký thành công!");
      navigation.navigate("LoginScreen");
    }

    } else {
      // Xử lý cho doanh nghiệp
      if (!name || !email || !phone || !tax || !password || !confirmPassword || !frontCCCDImage || !backCCCDImage || !businessLicenseImage) {
        Alert.alert("Lỗi", "Tất cả các trường là bắt buộc.");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu không khớp.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ.");
        return;
      }

      const phoneRegex = /^[0-9]{10,12}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ (10-12 số).");
        return;
      }

      // Log thông tin đăng ký doanh nghiệp
      console.log("Thông tin đăng ký doanh nghiệp:", {
        name,
        email,
        phone,
        tax,
        frontCCCDImage,
        backCCCDImage,
        businessLicenseImage,
        password,
      });

      Alert.alert("Thành công", "Đăng ký doanh nghiệp thành công!");
      navigation.navigate("LoginScreen");
    }
  } catch (error: any) {
    console.error("Lỗi khi đăng ký:", error);
    
    // Firebase error handling
    if (error.code === 'auth/email-already-in-use') {
      Alert.alert("Lỗi", "Email đã được sử dụng.");
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert("Lỗi", "Email không hợp lệ.");
    } else if (error.code === 'auth/weak-password') {
      Alert.alert("Lỗi", "Mật khẩu quá yếu.");
    } else {
      Alert.alert("Lỗi", "Đã xảy ra lỗi: " + error.message);
    }
  }
};


  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
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
          text="Đăng Ký"
          size={24}
          styles={{ fontWeight: "800", margin: 5 }}
        />
      </SectionComponent>

      <View style={{ marginTop: -20 }}>
        {/*  user và doanh nghiệp */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "user" && styles.activeTab]}
            onPress={() => setActiveTab("user")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "user" && styles.activeTabText,
              ]}
            >
              Người dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "business" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("business")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "business" && styles.activeTabText,
              ]}
            >
              Doanh nghiệp
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Phần đăng ký */}
        {activeTab === "user" ? (
          <View style={styles.formContainer}>
            <SectionComponent>
              <InputComponent
                value={name}
                placeholder="Họ và tên"
                onChange={(val) => setName(val)}
                allowClear
                affix={<Profile size={22} color={appColors.gray2} />}
              />
              <InputComponent
                value={email}
                placeholder="abc@gmail.com"
                onChange={(val) => setEmail(val)}
                allowClear
                affix={<Sms size={22} color={appColors.gray2} />}
              />
              <InputComponent
                value={phone}
                placeholder="Số điện thoại"
                onChange={(val) => setPhone(val)}
                allowClear
                affix={<CallCalling size={22} color={appColors.gray2} />}
              />
              <InputComponent
                value={password}
                placeholder="Nhập mật khẩu của bạn"
                onChange={(val) => setPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray2} />}
              />
              <InputComponent
                value={confirmPassword}
                placeholder="Xác nhận mật khẩu của bạn"
                onChange={(val) => setConfirmPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray2} />}
              />
            </SectionComponent>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <SectionComponent>
              {/* Họ và tên */}
              <InputComponent
                value={name}
                placeholder="Họ và tên"
                onChange={(val) => setName(val)}
                allowClear
                affix={<Profile size={22} color={appColors.gray2} />}
              />
              {/* Gmail */}
              <InputComponent
                value={email}
                placeholder="abc@gmail.com"
                onChange={(val) => setEmail(val)}
                allowClear
                affix={<Sms size={22} color={appColors.gray2} />}
              />
              {/* Phone */}
              <InputComponent
                value={phone}
                placeholder="Số điện thoại"
                onChange={(val) => setPhone(val)}
                allowClear
                affix={<CallCalling size={22} color={appColors.gray2} />}
              />
              {/* Số cccd */}
              <InputComponent
                value={phone}
                placeholder="Số căn cước công dân"
                onChange={(val) => setPhone(val)}
                allowClear
                affix={<Bookmark size={22} color={appColors.gray2} />}
              />

              <View>
                <RowComponent justify="flex-start">
                  <TextComponent text="CCCD" styles={{ fontWeight: "bold" }} />
                  <TextComponent text=" (Mặt trước)" />
                  <TextComponent text=" *" color="red" />
                </RowComponent>
                <TextComponent text="Hãy thêm mặt trước CCCD" />
                <ImagePickerComponent
                  image={frontCCCDImage}
                  placeholderImage={require("@/assets/images/mat_truoc_cccd.png")}
                  onImagePicked={setFrontCCCDImage}
                />
              </View>

              {/* Ảnh cccd mặt sau */}
              <View>
                <RowComponent justify="flex-start">
                  <TextComponent text="CCCD" styles={{ fontWeight: "bold" }} />
                  <TextComponent text=" (Mặt sau)" />
                  <TextComponent text=" *" color="red" />
                </RowComponent>
                <TextComponent text="Hãy thêm mặt sau CCCD" />
                <ImagePickerComponent
                  image={backCCCDImage}
                  placeholderImage={require("@/assets/images/mat_sau_cccd.png")}
                  onImagePicked={setBackCCCDImage}
                />
              </View>

              <InputComponent
                value={tax}
                placeholder="Nhập mã kinh doanh của bạn"
                onChange={(val) => setTax(val)}
                isPassword
                allowClear
                affix={<Bank size={22} color={appColors.gray2} />}
              />

              <View>
                <RowComponent justify="flex-start">
                  <TextComponent
                    text="Giấy phép kinh doanh"
                    styles={{ fontWeight: "bold" }}
                  />
                  <TextComponent text=" *" color="red" />
                </RowComponent>
                <TextComponent text="Hãy thêm ảnh giấy phép kinh doanh" />
                <ImagePickerComponent
                  image={businessLicenseImage}
                  placeholderImage={require("@/assets/images/giay_phep_kinh_doanh.png")}
                  onImagePicked={setBusinessLicenseImage}
                />
              </View>

              <InputComponent
                value={password}
                placeholder="Nhập mật khẩu của bạn"
                onChange={(val) => setPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray2} />}
              />
              <InputComponent
                value={confirmPassword}
                placeholder="Xác nhận mật khẩu của bạn"
                onChange={(val) => setConfirmPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray2} />}
              />
            </SectionComponent>
          </View>
        )}
      </ScrollView>

      {/* Nút đăng ký cố định ở dưới */}
      <View style={styles.footer}>
        <SectionComponent styles={{ marginBottom: -10 }}>
          <ButtonComponent
            text="Đăng ký"
            color={appColors.danger}
            type="primary"
            textStyles={{ fontWeight: "bold", fontSize: 20 }}
            onPress={onRegisterUser}
          />
        </SectionComponent>
        <SectionComponent>
          <RowComponent justify="center">
            <TextComponent text="Bạn đã có tài khoản? " />
            <ButtonComponent
              text="Đăng nhập"
              color={appColors.danger}
              type="link"
              onPress={() => navigation.navigate("LoginScreen")}
            />
          </RowComponent>
        </SectionComponent>
      </View>
    </KeyboardAvoidingView>
  );
};

// Style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#f44336",
  },
  tabText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  activeTabText: {
    color: "#fff",
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
  },
});

export default RegisterScreen; 