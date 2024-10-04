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
} from "react-native";

const RegisterScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tax, setTax] = useState("");

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
                <Image
                  style={styles.image}
                  source={require("@/assets/images/mat_truoc_cccd.png")}
                />
              </View>
              <View>
                <RowComponent justify="flex-start">
                  <TextComponent text="CCCD" styles={{ fontWeight: "bold" }} />
                  <TextComponent text=" (Mặt sau)" />
                  <TextComponent text=" *" color="red" />
                </RowComponent>
                <TextComponent text="Hãy thêm mặt sau CCCD" />
                <Image
                  style={styles.image}
                  source={require("@/assets/images/mat_sau_cccd.png")}
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
                  <TextComponent text="Giấy phép kinh doanh" styles={{ fontWeight: "bold" }} />
                  <TextComponent text=" *" color="red" />
                </RowComponent>
                <TextComponent text="Hãy thêm ảnh giấy phép kinh doanh" />
                <Image
                  style={[styles.image, { width: 380, height: 300, marginTop: 20
                    ,borderWidth: 1, 
                    borderColor: appColors.gray2, 
                    borderRadius: 10,
                    marginBottom: 20,
                  }]}
                  source={require("@/assets/images/giay_phep_kinh_doanh.png")}
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
            onPress={() => navigation.navigate("LoginScreen")}
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
    paddingTop: 50
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
  image: {
    width: 380,
    height: 300,
    resizeMode: "contain",
    marginTop: -20,
    marginBottom: -20,
    marginStart: 0,
  },
});

export default RegisterScreen;
