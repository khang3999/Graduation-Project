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
  ActivityIndicator,
} from "react-native";
import ImagePickerComponent from "@/components/images/ImagePickerComponent";
import {
  database,
  getDownloadURL,
  ref,
  set,
  storageRef,
  uploadBytes,
} from "@/firebase/firebaseConfig";
import { UserRegister } from "@/model/UserRegister";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, storage } from "@/firebase/firebaseConfig";

const RegisterScreen = ({ navigation }: any) => {
  //Thêm trạng thái
  const [isLoading, setIsLoading] = useState(false);
  const [textLoading, setTextLoading] = useState("Đăng ký");
  // Thanh chuyển tab
  const [activeTab, setActiveTab] = useState("user");
  // Thông tin đăng ký
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [numberCCCD, setNumberCCCD] = useState("");
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  // Lưu ảnh
  const [frontCCCDImage, setFrontCCCDImage] = useState<string | null>(null);
  const [backCCCDImage, setBackCCCDImage] = useState<string | null>(null);
  const [businessLicenseImage, setBusinessLicenseImage] = useState<
    string | null
  >(null);

  //Up ảnh lên storage
  const uploadImage = async (
    imageUri: string,
    path: string
  ): Promise<string | null> => {
    try {
      console.log(frontCCCDImage);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageReference = storageRef(storage, path);
      await uploadBytes(storageReference, blob);
      const url = await getDownloadURL(storageReference);
      return url;
    } catch (error) {
      console.error("Upload image failed", error);
      return null;
    }
  };
  // Xử lý đăng ký
  const onRegisterUser = async () => {
    try {
      if (activeTab === "user") {
        if (!name || !email || !phone || !password || !confirmPassword) {
          Alert.alert("Thông báo", "Bạn cần nhập đủ thông tin.");
          return;
        }

        if (password !== confirmPassword) {
          Alert.alert(
            "Thông báo",
            "Mật khẩu xác nhận không khớp với mật khẩu bạn tạo."
          );
          return;
        }
        if (password.length < 6) {
          Alert.alert("Thông báo", "Mật khẩu phải có ít nhất 6 ký tự.");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert(
            "Thông báo",
            "Vui lòng nhập địa chỉ email hợp lệ (abc@gmail.com)."
          );
          return;
        }

        const phoneRegex = /^[0-9]{10,12}$/;
        if (!phoneRegex.test(phone)) {
          Alert.alert(
            "Thông báo",
            "Vui lòng nhập số điện thoại hợp lệ (10-12 số)."
          );
          return;
        }
        setIsLoading(true);
        setTextLoading("Đang xử lý...");
        // Luu thông tin đăng ký người dùng tren auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // console.log(userCredential);
        const user = userCredential.user;
        await sendEmailVerification(user);
        Alert.alert(
          "Xác nhận email",
          "Một email xác nhận đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư đến và xác nhận."
        );
        if (user) {
          // Tạo đối tượng User mới
          const behavior = "";
          const avatar = await getDownloadURL(
            storageRef(storage, "defaultAvatar/avatar.png")
          ); // Set default avatar URL

          const status = "2";
          const currentDate = new Date().toLocaleDateString();
          const role = "user";

          const newUser = new UserRegister({
            name,
            email,
            phone,
            totalLikes,
            totalPosts,
            password,
            behavior,
            avatar,
            balance: null,
            accumulate : null,
            currentDate,
            status_id: status,
            role: role,
            numberCCCD: null,
            imageFrontUrlCCCD: null,
            imageBackUrlCCCD: null,
            business_license_id: null,
            imageUrlBusinessLicense: null,
          });
          // console.log(newUser);

          // // Lưu thông tin người dùng vào Firebase Realtime
          await set(ref(database, `/accounts/${user.uid}`), {
            id: user.uid,
            fullname: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            totalLikes: newUser.totalLikes,
            totalPosts: newUser.totalPosts,
            behavior: newUser.behavior,
            avatar: newUser.avatar,
            createdAt: newUser.currentDate,
            status_id: newUser.status_id,
            role: newUser.role,
          });
          Alert.alert("Thành công", "Đăng ký thành công!");
          navigation.navigate("LoginScreen");
        }
      } else {
        // Xử lý cho doanh nghiệp
        if (
          !name ||
          !email ||
          !phone ||
          !businessLicense ||
          !password ||
          !confirmPassword ||
          !frontCCCDImage ||
          !backCCCDImage ||
          !businessLicenseImage ||
          !numberCCCD
        ) {
          Alert.alert("Thông báo", "Bạn cần nhập đủ thông tin.");
          return;
        }

        if (password !== confirmPassword) {
          Alert.alert("Thông báo", "Mật khẩu không khớp.");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email hợp lệ.");
          return;
        }

        const phoneRegex = /^[0-9]{10,12}$/;
        if (!phoneRegex.test(phone)) {
          Alert.alert(
            "Thông báo",
            "Vui lòng nhập số điện thoại hợp lệ (10-12 số)."
          );
          return;
        }
        const cccdRegex = /^[0-9]{9,12}$/;
        if (!cccdRegex.test(numberCCCD)) {
          Alert.alert("Thông báo", "Vui lòng nhập số CCCD hợp lệ (9-12 số).");
          return;
        }
        setIsLoading(true);
        setTextLoading("Đang xử lý...");
        // Luu thông tin đăng ký người dùng tren auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // console.log(userCredential);
        const user = userCredential.user;
        await sendEmailVerification(user);
      
        if (user) {
          // Tạo đối tượng User mới
          const behavior = "";
          const balance = 0;
          const accumulate = 0;
          const currentDate = new Date().toLocaleDateString();
          const status = "1";
          const role = "business";
          const avatar = await getDownloadURL(
            storageRef(storage, "defaultAvatar/avatar.png")
          );

          const newUser = new UserRegister({
            name,
            email,
            phone,
            totalLikes,
            totalPosts,
            password,
            behavior,
            avatar,
            balance,
            accumulate,
            currentDate,
            numberCCCD,
            imageFrontUrlCCCD: frontCCCDImage,
            imageBackUrlCCCD: backCCCDImage,
            business_license_id: businessLicense,
            imageUrlBusinessLicense: businessLicenseImage,
            status_id: status,
            role: role,
          });

          let frontImageUrl, backImageUrl, businessLicenseImageUrl;

          if (newUser.imageFrontUrlCCCD) {
            frontImageUrl = await uploadImage(
              newUser.imageFrontUrlCCCD,
              `accounts/${user.uid}/papers/frontCCCD.jpg`
            );
          }

          if (newUser.imageBackUrlCCCD) {
            backImageUrl = await uploadImage(
              newUser.imageBackUrlCCCD,
              `accounts/${user.uid}/papers/backCCCD.jpg`
            );
          }

          if (newUser.imageUrlBusinessLicense) {
            businessLicenseImageUrl = await uploadImage(
              newUser.imageUrlBusinessLicense,
              `accounts/${user.uid}/papers/businessLicense.jpg`
            );
          }
          Alert.alert(
            "Xác nhận email",
            "Một email xác nhận đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư đến và xác nhận."
          );
          // Lưu thông tin người dùng vào Firebase Realtime với các URL ảnh đã upload
          await set(ref(database, `/accounts/${user.uid}`), {
            id: user.uid,
            fullname: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            behavior: newUser.behavior,
            avatar: newUser.avatar,
            numberCCCD: newUser.numberCCCD,
            imageFrontUrlCCCD: frontImageUrl,
            imageBackUrlCCCD: backImageUrl,
            imageUrlBusinessLicense: businessLicenseImageUrl,
            business_license_id: newUser.business_license_id,
            createdAt: newUser.currentDate,
            status_id: newUser.status_id,
            balance: newUser.balance,
            accumulate: newUser.accumulate,
            role: newUser.role,
          });
        }

        Alert.alert("Thành công", "Đăng ký doanh nghiệp thành công!");
        navigation.navigate("LoginScreen");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setTextLoading("Đăng ký");
        setIsLoading(false);
        Alert.alert("Thông báo", "Email đã được sử dụng.");
      } else {
        setTextLoading("Đăng ký");
        setIsLoading(false);
        Alert.alert("Thông báo", "Đã xảy ra lỗi: " + error.message);
      }
    } finally {
      setTextLoading("Đăng ký");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <SectionComponent>
        <ArrowLeft
          size="32"
          style={{ marginBottom: -10 }}
          onPress={() => navigation.navigate("LoginScreen")}
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

        <View style={{padding: 15}}>
          <TextComponent text="Chú ý" styles={{fontWeight: 'bold'}} />
          <TextComponent text="Thông tin cá nhân nhập phải thực sự chính xác" color={appColors.danger} styles={{fontWeight: 'bold'}}/>
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
              {/* Số cccd */}

              <InputComponent
                value={numberCCCD}
                placeholder="Số căn cước công dân"
                onChange={(val) => setNumberCCCD(val)}
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
                value={businessLicense}
                placeholder="Nhập mã kinh doanh của bạn"
                onChange={(val) => setBusinessLicense(val)}
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
            </SectionComponent>
          </View>
        )}
      </ScrollView>

      {/* Nút đăng ký cố định ở dưới */}
      <View style={styles.footer}>
        {isLoading ? (
          <ButtonComponent
            text={textLoading}
            color={appColors.danger}
            type="primary"
            textStyles={{ fontWeight: "bold", fontSize: 20 }}
            onPress={onRegisterUser}
            // disabled={isLoading}
          />
        ) : (
          <ButtonComponent
            text={textLoading}
            color={appColors.danger}
            type="primary"
            textStyles={{ fontWeight: "bold", fontSize: 20 }}
            onPress={onRegisterUser}
            // disabled={isLoading}
          />
        )}
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
        {isLoading && (
          <Modal transparent={true} animationType="none" visible={isLoading}>
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={appColors.danger} />
            </View>
          </Modal>
        )}
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
    paddingBottom: -15,
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
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default RegisterScreen;
