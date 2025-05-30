import { View, StyleSheet } from "react-native";
import AvatarProfile from "./AvatarProfile";
import {
  IconButton,
  MD3Colors,
} from "react-native-paper";
import React, { useState } from "react";
import { router } from "expo-router";
import MenuItem from "@/components/buttons/MenuProfileButton";
import HeaderProfileSkeleton from "@/components/skeletons/HeaderProfileSkeleton";
import SearchButton from "@/components/buttons/SearchButton";
import { useAccount } from "@/contexts/AccountProvider";


interface HeaderProfileProps {
  onModalOpen?: () => void;
  onModalClose?: () => void;
  handleSearch?: (searchTerm: string) => void;
  isSearched: boolean;
}

export default function HeaderProfile({ onModalOpen = () => { }, onModalClose = () => { }, handleSearch = () => { }, isSearched }: HeaderProfileProps) {
  const [isDisplay, setIsDisplay] = useState(true);
  const { dataAccount } = useAccount();

  if (!dataAccount) {
    return <HeaderProfileSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.headerButton}>
          {!isSearched && (
            <>
              <SearchButton setDisplay={setIsDisplay} onModalOpen={onModalOpen} onModalClose={onModalClose} handleSearch={handleSearch} />
            
            </>
          )}
           <MenuItem menuIcon="menu" isDisplay={isDisplay} isSearched={isSearched} />
        </View>
      </View>
      <AvatarProfile isSearched={isSearched} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
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
    paddingHorizontal: 25,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-evenly",
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
