import RouterAuth from "@/app/(auth)/RouterAuth";
import React, { useEffect, useState } from "react";
import { StyleSheet, Alert, Linking } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue, off, Query } from "@firebase/database";
import { database } from "@/firebase/firebaseConfig";

const Layout = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let userRef: any;
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        userRef = ref(database, `accounts/${token}`);

        // Lắng nghe thay đổi trạng thái tài khoản
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();

          if (data && data.status_id === 2) {
            setIsAuth(true);
            setRole(data.role);
          } else {
            // Xử lý nếu tài khoản bị khóa
            Alert.alert(
              "Tài khoản đã bị cấm",
              "Vui lòng liên hệ quản trị viên để biết thêm thông tin.",
              [
                {
                  text: "Gọi Tổng Đài",
                  onPress: () => Linking.openURL("tel:0384946973"),
                },
                {
                  text: "Gửi email",
                  onPress: () => Linking.openURL("mailto:dongochieu333@gmail.com"),
                },
                { text: "Đóng", style: "cancel" },
              ],
              { cancelable: true }
            );
            await AsyncStorage.removeItem("userToken");
            setIsAuth(false);
            router.replace("/(auth)/LoginScreen");
          }
        });
      } else {
        setIsAuth(false);
      }
    };

    checkToken();

    return () => {
      if (userRef) off(userRef);
    };
  }, []);

  useEffect(() => {
    if (isAuth) {
      console.log(isAuth, role);
      if (role === "admin") {
        router.replace("/(admin)/(account)/account");
      } else {
        router.replace("/(tabs)");
        // router.replace("/(trending)/cityTrending");
      }
    }
  }, [role]);

  return <>{!isAuth ? <RouterAuth /> : null}</>;
};

const styles = StyleSheet.create({});

export default Layout;
