import { Text, View, StyleSheet,Dimensions,Animated,Easing, TouchableOpacity, TextInput } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AvatarProfile from "./AvatarProfile";
import {
  IconButton,
  MD3Colors,
  Menu,
  Provider,
  Divider,  
} from "react-native-paper";
import React, { useEffect, useRef, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Link, router, useRouter} from "expo-router";
import MenuItem from "@/components/buttons/MenuProfileButton";
import HeaderProfileSkeleton from "@/components/skeletons/HeaderProfileSkeleton";
import SearchButton from "@/components/buttons/SearchButton";
import IconFeather from 'react-native-vector-icons/Feather';
import { set } from "lodash";
import { useAccount } from "@/contexts/AccountProvider";

const Bell = () => (
  <IconButton
    icon="bell-outline"
    iconColor={MD3Colors.error10}
    size={24}
    onPress={() => router.push("/Notification")}
    style={styles.button}
    accessible={true}
    accessibilityLabel="Notifications button"
  />
);

interface HeaderProfileProps {  
  onModalOpen: () => void;
  onModalClose: () => void;
  handleSearch: (searchTerm: string) => void;
}

export default function HeaderProfile({ onModalOpen ,onModalClose,handleSearch}: HeaderProfileProps) {
  const [isDisplay, setIsDisplay] = useState(true);
  const { accountData } = useAccount();
  if(!accountData) {
    return <HeaderProfileSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>           
        <View style={styles.headerButton}>          
          {/* <Bell />           */}
          <SearchButton setDisplay={setIsDisplay} onModalOpen={onModalOpen} onModalClose={onModalClose} handleSearch={handleSearch}/>
          <MenuItem menuIcon="menu" isDisplay={isDisplay}/>
        </View>
      </View>
      <AvatarProfile isSearched={false}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {    
    flex: 1,
    marginTop: 20,
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    margin: 2,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  headerButton: {
    paddingHorizontal:24,
    paddingTop:5,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginEnd: 20,
  },
  button: {
    margin: 0,        
  },
  menuContent: {
    backgroundColor: "#f2f2f2",
  },
  menuItem: {
    paddingVertical: 5,
  },
});
