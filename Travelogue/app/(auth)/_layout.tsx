import RouterAuth from "@/app/(auth)/RouterAuth";
import React, { useEffect, useState } from "react";
import { StyleSheet, Alert, Linking } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "@firebase/database";
import { database } from "@/firebase/firebaseConfig";

const Layout = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        const userRef = ref(database, "accounts/" + token);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        setRole(data.role);

        if (data && data.status_id === "2") {
          setIsAuth(true);
        } else {
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
          await AsyncStorage.removeItem("userToken");
          setIsAuth(false);
        }
      } else {
        setIsAuth(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (isAuth) {
      if (role === "admin") {
        router.replace('/(admin)/(account)/account')
      }
      else {
        router.replace({
          pathname: "/(tabs)",
          params: { userRole: role },
        });
      }
    }
  }, [isAuth]);

  return (
    <>
      {!isAuth ? <RouterAuth /> : null}
    </>
  );
};

const styles = StyleSheet.create({});

export default Layout;