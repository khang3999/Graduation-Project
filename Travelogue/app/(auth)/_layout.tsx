import RouterAuth from "@/app/(auth)/RouterAuth";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Layout = () => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("userToken");  
      setIsAuth(!!token);  
    };

    checkToken(); 
  }, []);

  useEffect(() => {
    if (isAuth) {
      router.push("/(tabs)/");  
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
