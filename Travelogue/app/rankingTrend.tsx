import { RowComponent } from "@/components";
import { useRanking } from '@/contexts/RankingContext';
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Toast from "react-native-toast-message-custom";
import Icon from "react-native-vector-icons/Ionicons";

const rankingPosts = [
  {
    id: "1",
    name: "Bài viết A",
    score: 9999,
    image: "",
  },
  {
    id: "2",
    name: "Bài viết B",
    score: 8888,
    image: "",
  },
  {
    id: "3",
    name: "Bài viết C",
    score: 7777,
    image: "",
  },
  {
    id: "4",
    name: "Bài viết D",
    score: 6666,
    image: "",
  },
];

const RankingTrend = () => {
  const { citiesData, hasNewUpdates, isRefreshing, refreshData } = useRanking();
  const animationRef = useRef<LottieView>(null);
  const [activeTab, setActiveTab] = useState("Địa điểm");
  const rankingData = activeTab === "Địa điểm" ? citiesData : rankingPosts;

  useEffect(() => {
    animationRef.current?.play(50, 160);
  });

  const handleRefresh = async () => {
    if (!isRefreshing && hasNewUpdates) {
      await refreshData();
    }
  };
  useEffect(() => {
    if (hasNewUpdates) {
      Toast.show({
        type: "success",
        text1: "Có dữ liệu mới!",
        text2: "Nhấn nút cập nhật để xem.",
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  }, [hasNewUpdates]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <RowComponent
        justify="space-between"
        styles={{
          marginTop: 15,
          marginBottom: 5,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* exit */}
        <View style={{ width: 26, alignItems: "flex-start" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={26} color="black" />
          </TouchableOpacity>
        </View>

        {/* tiêu đề */}
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          Bảng xếp hạng
        </Text>

        {/* refresh */}
        <View style={{ width: 26, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isRefreshing || !hasNewUpdates}
            style={[
              styles.refreshButton,
              hasNewUpdates && !isRefreshing && styles.refreshButtonActive,
            ]}
          >
            <Icon
              name="reload"
              size={26}
              color={hasNewUpdates && !isRefreshing ? "#4CAF50" : "black"}
            />
          </TouchableOpacity>
        </View>
      </RowComponent>

      {/* content */}
      <View>
        <Text
          style={{
        textAlign: "center",
        fontSize: 12,
        color: hasNewUpdates ? "#4CAF50" : "#FF0066",
        marginBottom: 10,
          }}
        >       
        **Bảng xếp hạng tự động cập nhật từng giờ.**"
        </Text>
      </View>
      {/* "Địa điểm", "Bài Viết" */}
      <View style={styles.tabContainer}>
        {["Địa điểm", "Bài Viết"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tab}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeText]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 3 top */}
      <View style={styles.topRanking}>
        {/* top 2 */}
        <TouchableOpacity
          style={styles.rankContainer}
          onPress={() => console.log("Bạn đã nhấn vào:", rankingData[1]?.name)}
          disabled={!rankingData[1]}
        >
          {rankingData[1] && (
            <>
              <View style={[styles.rankCircle, { borderColor: "#AAAAAA" }]}>
                <View style={styles.rankImageContainer}>
                  <Image
                    source={{
                      uri:
                        rankingData[1].image ||
                        "https://mediatech.vn/assets/images/imgstd.jpg",
                    }}
                    style={styles.rankImageFill}
                  />
                </View>
                <View
                  style={[
                    styles.rankNumberCircle,
                    { backgroundColor: "#AAAAAA" },
                  ]}
                >
                  <Text style={styles.rankNumberText}>2</Text>
                </View>
              </View>
              <Text style={styles.nameText}>{rankingData[1].name}</Text>
              <Text style={styles.levelText}>
                Score: {rankingData[1].score}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* top 1 */}
        <TouchableOpacity
          style={[styles.rankContainer, { marginHorizontal: 16 }]}
          onPress={() => console.log("Bạn đã nhấn vào:", rankingData[0]?.name)}
          disabled={!rankingData[0]}
        >
          {rankingData[0] && (
            <>
              <View style={[styles.rankCircleBig, { borderColor: "#FFCA28" }]}>
                <View style={styles.rankImageContainerBig}>
                  <Image
                    source={{
                      uri:
                        rankingData[0].image ||
                        "https://mediatech.vn/assets/images/imgstd.jpg",
                    }}
                    style={styles.rankImageFillBig}
                  />
                </View>
                <View
                  style={[
                    styles.rankNumberCircleBig,
                    { backgroundColor: "#FFCA28" },
                  ]}
                >
                  <Text style={styles.rankNumberText}>1</Text>
                </View>
                <View>
                  {/* <Image
                    source={require("@/assets/images/Crown.png")}
                    style={styles.crownImage}
                  /> */}
                  <LottieView
                    ref={animationRef}
                    source={require("../assets/images/crown.json")}
                    loop
                    style={styles.crownImage}
                  />
                </View>
              </View>
              <Text style={styles.nameText}>{rankingData[0].name}</Text>
              <Text style={styles.levelText}>
                Score: {rankingData[0].score}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* top 3 */}
        <TouchableOpacity
          style={styles.rankContainer}
          onPress={() => console.log("Bạn đã nhấn vào:", rankingData[2]?.name)}
          disabled={!rankingData[2]}
        >
          {rankingData[2] && (
            <>
              <View style={[styles.rankCircle, { borderColor: "#FF8228" }]}>
                <View style={styles.rankImageContainer}>
                  <Image
                    source={{
                      uri:
                        rankingData[2].image ||
                        "https://mediatech.vn/assets/images/imgstd.jpg",
                    }}
                    style={styles.rankImageFill}
                  />
                </View>
                <View
                  style={[
                    styles.rankNumberCircle,
                    { backgroundColor: "#FF8228" },
                  ]}
                >
                  <Text style={styles.rankNumberText}>3</Text>
                </View>
              </View>
              <Text style={styles.nameText}>{rankingData[2].name}</Text>
              <Text style={styles.levelText}>
                Score: {rankingData[2].score}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Danh sách các hạng còn lại */}
      <FlatList
        data={rankingData.slice(3)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => console.log("Bạn đã nhấn vào:", item.name)}
          >
            <Text style={styles.rankNumber}>{index + 4}</Text>
            <Image
              source={{
                uri:
                  item.image || "https://mediatech.vn/assets/images/imgstd.jpg",
              }}
              style={styles.rankImageSmall}
            />
            <Text style={styles.rankName}>{item.name}</Text>
            <Text style={styles.rankScore}>{item.score}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  tabText: { fontSize: 18, fontWeight: "bold", color: "gray" },
  activeText: { color: "#ff6347" },
  underline: {
    width: "100%",
    height: 3,
    marginTop: 4,
    backgroundColor: "#ff6347",
    borderRadius: 5,
  },

  /** contan 3 top */
  topRanking: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginVertical: 45,
  },
  rankContainer: {
    alignItems: "center",
  },

  /** vòng tròn hiển thị rank   */
  rankCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  rankCircleBig: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },

  /**  ảnh rank */
  rankImageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    overflow: "hidden",
  },
  rankImageContainerBig: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    overflow: "hidden",
  },

  /** ảnh full */
  rankImageFill: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rankImageFillBig: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /** vòng tròn nhỏ top 2, top 3 */
  rankNumberCircle: {
    position: "absolute",
    top: "82%",
    left: "50%",
    transform: [{ translateX: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f8f8f8",
    zIndex: 2,
  },
  /** vòng tròn nhỏ Top 1 */
  rankNumberCircleBig: {
    position: "absolute",
    top: "80%",
    left: "50%",
    transform: [{ translateX: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
  },
  rankNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  /** tên và score */
  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  levelText: {
    fontSize: 12,
    color: "#666",
  },

  /** danh sách các hạng còn lại */
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginRight: 20,
  },
  rankImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#444444",
    marginRight: 10,
  },
  rankName: { fontSize: 14, fontWeight: "bold", color: "black", flex: 1 },
  rankScore: { fontSize: 14, color: "#555" },
  crownImage: {
    position: "absolute",
    top: -150,
    left: "-30%",
    width: 90,
    height: 90,
    resizeMode: "contain",
    rotation: 0,
    transform: [{ rotate: "15deg" }],
    zIndex: 3,
  },
  /** nút refresh */
  refreshButton: {
    padding: 5,
    borderRadius: 13,
    backgroundColor: "transparent",
  },
  refreshButtonActive: {
    backgroundColor: "#E8F5E9",
  },
});

export default RankingTrend;
