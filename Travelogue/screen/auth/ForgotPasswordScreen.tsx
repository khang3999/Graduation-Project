import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ButtonComponent,
  InputComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from "../../components";
import { ArrowLeft, Sms } from "iconsax-react-native";
import { appColors } from "../../constants/appColors";
import AntDesign from '@expo/vector-icons/AntDesign';

const ForgotPasswordScreen = ({navigation}: any) => {
  <AntDesign name="arrowleft" size={24} color="black" />
  const [email, setEmail] = useState("");
  return (
    <View>
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
          onPress={() => {}}
        />
      </SectionComponent>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ForgotPasswordScreen;
