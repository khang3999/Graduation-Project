import RouterAuth from "@/app/(auth)/RouterAuth";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";


const Layout = () => {
  const [isAuth, setIsAuth] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser; 
      console.log(user);
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
      console.log(user ? "User is authenticated" : "User is not authenticated"); 
    };
    checkAuth(); 
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
