import { router } from "expo-router";
import React, { useEffect } from "react";
import { View, Image, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRanking } from "@/contexts/RankingContext";
import { iconColors } from "@/assets/colors";
import { icons } from "@/assets/icons";
import { MaterialIcons } from "@expo/vector-icons";

// interface StoryItemProps {
//   item: {
//     id: string;
//     name: string;
//     image: string;
//     id_nuoc: string;
//   };
// }

const StoryItem = ({ item }: any) => (
  <TouchableOpacity
    style={{ alignItems: "center", marginHorizontal: 8 }}
    onPress={() => {
      router.push({
        pathname: "/galleryCities",
        params: {
          idCity: item.key,
          idCountry: item.idCountry,
        },
      });
    }}
  >
    <View
      style={{
        width: 75,
        height: 75,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: iconColors.green1,
        padding: 2,
      }}
    >
      <Image
        source={{
          uri: item.defaultImages?.[0]
        }}
        style={{ width: "100%", height: "100%", borderRadius: 50 }}
      />
    </View>
    <Text
      style={{ color: "black", fontSize: 13, marginTop: 5, fontWeight: "500" }}
    >
      {item.value}
    </Text>
  </TouchableOpacity>
);

const Featured = () => {
  const { citiesData } = useRanking();

  useEffect(() => {
    // console.log(citiesData, "Cities data in Featured component");

  }, [])

  return (
    <View
      style={{ flexDirection: 'row', backgroundColor: iconColors.green1, marginVertical: 10 }}
    >
      <FlatList
        // data={[]}
        data={citiesData.slice(0, 4)}
        horizontal
        style={{
          flex: 1, padding: 10, backgroundColor: iconColors.green2, borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
        }}
        keyExtractor={(item:any) => item.key}
        renderItem={({ item }) => <StoryItem item={item} />}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity
        style={{
          backgroundColor: iconColors.green1,
          justifyContent: "center",
          alignItems: "center",
          padding: 2

        }}
        onPress={() => {
          // router.push({
          //   pathname: "/rankingTrend",
          // });
          router.push({
            pathname: "/(trending)/cityTrending",
          });
        }}
      // activeOpacity={0.7}
      >
        <MaterialIcons name="read-more" size={28} color='white' />
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={{
          backgroundColor: iconColors.green1,
          justifyContent: "center",
          alignItems: "center",
          padding: 2

        }}
        onPress={() => {
          router.push({
            pathname: "/rankingTrend",
          });
          // router.push({
          //   pathname: "/(trending)/cityTrending",
          // });
        }}
      // activeOpacity={0.7}
      >
        <MaterialIcons name="read-more" size={28} color='white' />
      </TouchableOpacity> */}
    </View>
  );
};

export default Featured;
