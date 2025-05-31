import { RowComponent } from "@/components";
import { useRanking } from "@/contexts/RankingContext";
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

// Types
interface City {
  id: string;
  name: string;
  id_nuoc: string;
  area_id: string;
  image: string | null;
  score: number;
}

interface Post {
  title: string;
  id: string;
  created_at: number;
  author: {
    name: string;
    avatar?: string;
  };
  image: string;
  scores: number;
}

const abbreviateTitle = (title: string): string => {
  if (title.length <= 8) return title;
  
  const words = title.split(' ');
  const abbreviated = words.map(word => word.charAt(0)).join('');
  
  return abbreviated;
};

type RankingItem = City | Post;

const RankingTrend = () => {
  const { 
    citiesData, 
    postsData, 
    hasNewCitiesUpdates, 
    hasNewPostsUpdates, 
    isRefreshing, 
    refreshCitiesData,
    refreshPostsData 
  } = useRanking();
  const animationRef = useRef<LottieView>(null);
  const [activeTab, setActiveTab] = useState("Địa điểm");
  const rankingData = activeTab === "Địa điểm" ? (citiesData as City[]) : (postsData as Post[]);

  const isCity = (item: RankingItem): item is City => {
    return 'id_nuoc' in item;
  };

  useEffect(() => {
    animationRef.current?.play(50, 160);
  });

  const handleRefresh = async () => {
    if (!isRefreshing) {
      if (activeTab === "Địa điểm" && hasNewCitiesUpdates) {
        await refreshCitiesData();
      } else if (activeTab === "Bài Viết" && hasNewPostsUpdates) {
        await refreshPostsData();
      }
    }
  };

  useEffect(() => {
    if ((activeTab === "Địa điểm" && hasNewCitiesUpdates) || 
        (activeTab === "Bài Viết" && hasNewPostsUpdates)) {
      Toast.show({
        type: "success",
        text1: "Có dữ liệu mới!",
        text2: "Nhấn nút cập nhật để xem.",
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  }, [hasNewCitiesUpdates, hasNewPostsUpdates, activeTab]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
        <Text style={{ fontSize: 25, fontWeight: "bold", textAlign: "center" }}>
          Bảng xếp hạng
        </Text>

        {/* refresh */}
        <View style={{ width: 26, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isRefreshing || (activeTab === "Địa điểm" ? !hasNewCitiesUpdates : !hasNewPostsUpdates)}
            style={[
              styles.refreshButton,
              ((activeTab === "Địa điểm" && hasNewCitiesUpdates) || 
               (activeTab === "Bài Viết" && hasNewPostsUpdates)) && 
              !isRefreshing && styles.refreshButtonActive,
            ]}
          >
            <Icon
              name="refresh"
              size={26}
              style={{ width: 26, height: 26 }}
              color={((activeTab === "Địa điểm" && hasNewCitiesUpdates) || 
                      (activeTab === "Bài Viết" && hasNewPostsUpdates)) && 
                      !isRefreshing ? "#4CAF50" : "#FF0066"}
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
            color: ((activeTab === "Địa điểm" && hasNewCitiesUpdates) || 
                    (activeTab === "Bài Viết" && hasNewPostsUpdates)) ? 
                    "#4CAF50" : "#FF0066",
            marginBottom: 10,
          }}
        >
          **Bảng xếp hạng tự động cập nhật từng giờ.**
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
          onPress={() => 
            activeTab === "Địa điểm" 
              ? router.push({
                  pathname: "/galleryCities",
                  params: { idCity: rankingData[1]?.id, idCountry: (rankingData[1] as City)?.id_nuoc },
                })
              :  router.push({
                pathname: "/postDetail",
                params: { postId: rankingData[1].id },
              })
          }
          disabled={!rankingData[1]}
        >
          {rankingData[1] && (
            <>
              <View
                style={[
                  styles.rankCircle,
                  {
                    borderColor: "#AAAAAA",
                    width: 90,
                    height: 90,
                    borderRadius: 50,
                  },
                ]}
              >
                <View style={styles.rankImageContainer}>
                  <Image
                    source={{
                      uri:
                        (activeTab === "Địa điểm" 
                          ? (rankingData[1] as City).image
                          : (rankingData[1] as Post).image) ||
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
                <View>
                  <LottieView
                    source={require("../assets/images/sliver_crown.json")}
                    loop
                    autoPlay
                    style={styles.crownImageTop2}
                  />
                </View>
              </View>
              <Text
                style={[styles.nameText, { color: "#AAAAAA", fontSize: 15 }]}
              >
                {activeTab === "Địa điểm" 
                  ? (rankingData[1] as City).name
                  : abbreviateTitle((rankingData[1] as Post).title)}
              </Text>
              <Text
                style={[styles.levelText, { color: "#AAAAAA", fontSize: 15 }]}
              >
                {activeTab === "Địa điểm"
                  ? (rankingData[1] as City).score
                  : (rankingData[1] as Post).scores}
              </Text>
              {activeTab === "Bài Viết" && (
                <Text style={[styles.dateText, { color: "#AAAAAA" }]}>
                  {formatDate((rankingData[1] as Post).created_at)}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* top 1 */}
        <TouchableOpacity
          style={[styles.rankContainer, { marginHorizontal: 16 }]}
          onPress={() => 
            activeTab === "Địa điểm"
              ? router.push({
                  pathname: "/galleryCities",
                  params: { idCity: rankingData[0]?.id, idCountry: (rankingData[0] as City)?.id_nuoc },
                })
              :  router.push({
                pathname: "/postDetail",
                params: { postId: rankingData[0].id },
              })
          }
          disabled={!rankingData[0]}
        >
          {rankingData[0] && (
            <>
              <View style={[styles.rankCircleBig, { borderColor: "#FFCA28" }]}>
                <View style={styles.rankImageContainerBig}>
                  <Image
                    source={{
                      uri:
                        (activeTab === "Địa điểm"
                          ? (rankingData[0] as City).image
                          : (rankingData[0] as Post).image) ||
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
                  <LottieView
                    ref={animationRef}
                    source={require("../assets/images/crown.json")}
                    loop
                    style={styles.crownImageTop1}
                  />
                </View>
              </View>
              <Text
                style={[styles.nameText, { color: "#FFCA28", fontSize: 16 }]}
              >
                {activeTab === "Địa điểm"
                  ? (rankingData[0] as City).name
                  : abbreviateTitle((rankingData[0] as Post).title)}
              </Text>
              <Text
                style={[styles.levelText, { color: "#FFCA28", fontSize: 16 }]}
              >
                {activeTab === "Địa điểm"
                  ? (rankingData[0] as City).score
                  : (rankingData[0] as Post).scores}
              </Text>
              {activeTab === "Bài Viết" && (
                <Text style={[styles.dateText, { color: "#FFCA28" }]}>
                  {formatDate((rankingData[0] as Post).created_at)}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* top 3 */}
        <TouchableOpacity
          style={styles.rankContainer}
          onPress={() => 
            activeTab === "Địa điểm"
              ? router.push({
                  pathname: "/galleryCities",
                  params: { idCity: rankingData[2]?.id, idCountry: (rankingData[2] as City)?.id_nuoc },
                })
              : router.push({
                pathname: "/postDetail",
                params: { postId: rankingData[2].id },
              })
          }
          disabled={!rankingData[2]}
        >
          {rankingData[2] && (
            <>
              <View style={[styles.rankCircle, { borderColor: "#FF8228" }]}>
                <View style={styles.rankImageContainer}>
                  <Image
                    source={{
                      uri:
                        (activeTab === "Địa điểm"
                          ? (rankingData[2] as City).image
                          : (rankingData[2] as Post).image) ||
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
                <LottieView
                  source={require("../assets/images/bronze_crown.json")}
                  loop
                  autoPlay
                  speed={0}
                  style={styles.crownImageTop3}
                />
              </View>
              <Text
                style={[styles.nameText, { color: "#FF8228", fontSize: 14 }]}
              >
                {activeTab === "Địa điểm"
                  ? (rankingData[2] as City).name
                  : abbreviateTitle((rankingData[2] as Post).title)}
              </Text>
              <Text
                style={[styles.levelText, { color: "#FF8228", fontSize: 14 }]}
              >
                {activeTab === "Địa điểm"
                  ? (rankingData[2] as City).score
                  : (rankingData[2] as Post).scores}
              </Text>
              {activeTab === "Bài Viết" && (
                <Text style={[styles.dateText, { color: "#FF8228" }]}>
                  {formatDate((rankingData[2] as Post).created_at)}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* danh sách các hạng còn lại */}
      <FlatList<RankingItem>
        data={rankingData.slice(3)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => 
              isCity(item)
                ? router.push({
                    pathname: "/galleryCities",
                    params: { idCity: item.id, idCountry: item.id_nuoc },
                  })
                :  router.push({
                              pathname: "/postDetail",
                              params: { postId: item.id },
                            })
            }
          >
            <Text style={styles.rankNumber}>
              {(index + 4).toString().padStart(2, "0")}
            </Text>
            <Image
              source={{
                uri:
                  (isCity(item)
                    ? item.image
                    : item.image) ||
                  "https://mediatech.vn/assets/images/imgstd.jpg",
              }}
              style={styles.rankImageSmall}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.rankName}>
                {isCity(item) ? item.name : (item.title.length > 25 ? `${item.title.slice(0, 25)}...` : item.title)}
              </Text>
              {!isCity(item) && (
                <Text style={styles.dateText}>
                  {formatDate(item.created_at)}
                </Text>
              )}
            </View>
            <Text style={styles.rankScore}>
              {isCity(item) ? item.score : item.scores}
            </Text>
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
    marginBottom: 2,
    textShadowColor: "#222222",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  levelText: {
    fontSize: 15,
    textShadowColor: "#222222",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 1,
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
    color: "#333333",
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
  rankName: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "black"
  },
  rankScore: { 
    fontSize: 14, 
    color: "#555",
    marginLeft: 10
  },
  /** ảnh crown */
  crownImageTop1: {
    position: "absolute",
    top: -152,
    left: "-50%",
    width: 90,
    height: 90,
    resizeMode: "contain",
    rotation: 0,
    transform: [{ rotate: "0deg" }],
    zIndex: 3,
  },
  crownImageTop2: {
    position: "absolute",
    top: -123,
    left: -66,
    width: 72,
    height: 72,
    resizeMode: "contain",
    rotation: 0,
    transform: [{ rotate: "-30deg" }],
    zIndex: 3,
  },
  crownImageTop3: {
    position: "absolute",
    top: -35,
    left: 30,
    width: 60,
    height: 60,
    resizeMode: "contain",
    rotation: 0,
    transform: [{ rotate: "28deg" }],
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
  /** info container */
  infoContainer: {
    flex: 1,
  },
  /** date text */
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default RankingTrend;
