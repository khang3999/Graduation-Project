import { router } from "expo-router";
import React from "react";
import { View, Image, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRanking } from "@/contexts/RankingContext";

interface StoryItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    id_nuoc: string;
  };
}

const StoryItem = ({ item }: StoryItemProps) => (
  <TouchableOpacity
    style={{ alignItems: "center", marginHorizontal: 8 }}
    onPress={() => {
      router.push({
        pathname: "/gallery",
        params: {
          idCity: item.id,
          idCountry: item?.id_nuoc,
        },
      });
    }}
  >
    <View
      style={{
        width: 82,
        height: 82,
        borderRadius: 50,
        borderWidth: 3.5,
        borderColor: "#9966FF",
        padding: 2,
      }}
    >
      <Image
        source={{
          uri: item.image || "https://mediatech.vn/assets/images/imgstd.jpg",
        }}
        style={{ width: "100%", height: "100%", borderRadius: 50 }}
      />
    </View>
    <Text
      style={{ color: "white", fontSize: 13, marginTop: 5, fontWeight: "bold" }}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

const Featured = () => {
  const { citiesData } = useRanking();

  return (
    <View
      style={{ position: "relative", padding: 10, backgroundColor: "#000022" }}
    >
      <FlatList
        data={citiesData.slice(0, 4)}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryItem item={item} />}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 30,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 5,
        }}
        onPress={() => {
          router.push({
            pathname: "/rankingTrend",
          });
        }}
        activeOpacity={0.7}
      >
        <Icon name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Featured;
