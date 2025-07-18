import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import { useRanking } from '@/contexts/RankingContext';
import { MaterialIcons } from '@expo/vector-icons';
import { formatNumberShort } from '@/utils';
import { backgroundColors } from '@/assets/colors';
import { useIsFocused } from '@react-navigation/native';
const screenHeight = Dimensions.get('window').height;
const PostTrending = () => {
  const insets = useSafeAreaInsets();
  const { postsData1, fetchTrendingPost, setCurrentScreen } = useRanking()
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Màn hình hiện tại được focus
      setCurrentScreen('post')
      console.log("Đã quay lại màn hình - load lại dữ liệu");
      fetchTrendingPost();
    }
  }, [isFocused]);

  return (
    <View style={{ height: screenHeight - insets.bottom - insets.top }}>
      <Text
        style={{
          margin: 10,
          textAlign: "center",
          fontSize: 14,
          fontStyle: 'italic',
          // color: ((activeTab === "Địa điểm" && hasNewCitiesUpdates) ||
          //   (activeTab === "Bài Viết" && hasNewPostsUpdates)) ?
          //   "#4CAF50" : "#FF0066",
          color: "#4CAF50",
          marginBottom: 20,
        }}
      >
        ** Bảng xếp hạng tự động cập nhật mỗi giờ **
      </Text>

      {/* 3 top */}
      <View style={styles.topRanking}>
        {/* top 2 */}
        <TouchableOpacity
          style={styles.rankContainer}
          onPress={() =>
            router.push({
              pathname: "/postDetail",
              params: {
                postId: postsData1?.[1]?.id
              },
            })
          }
        // disabled={!rankingData[1]}
        >
          <View style={styles.wrapTopTrending}>
            {/* Image section */}
            <View
              style={[
                styles.rankCircleMedium,
              ]}
            >
              <View style={styles.rankImageContainer}>
                <Image
                  source={{
                    uri: postsData1?.[1]?.thumbnail ?? "https://mediatech.vn/assets/images/imgstd.jpg",
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
            <LottieView
              source={require("@/assets/images/sliver_crown.json")}
              loop
              autoPlay
              style={styles.crownImageTop2}
            />
            {/* Text section */}
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={[styles.nameText]}
                numberOfLines={1}
              >
                {postsData1?.[1]?.title}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text
                  style={[styles.levelText]}
                >
                  {formatNumberShort(postsData1?.[1]?.scores)}
                </Text>
                <MaterialIcons name="local-fire-department" size={22} color="red" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* top 1 */}
        <TouchableOpacity
          style={[styles.rankContainer]}
          onPress={() =>
            router.push({
              pathname: "/postDetail",
              params: {
                postId: postsData1?.[0]?.id
              },
            })
          }
        >
          {/* {rankingData[0] && ( */}
          <View style={styles.wrapTopTrending}>
            <View style={styles.rankCircleBig}>
              <View style={styles.rankImageContainer}>
                <Image
                  source={{
                    uri: postsData1?.[0]?.thumbnail ?? "https://mediatech.vn/assets/images/imgstd.jpg",
                  }}
                  style={styles.rankImageFill}
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
            </View>
            <LottieView
              // ref={animationRef}
              autoPlay
              source={require("@/assets/images/crown.json")}
              loop
              style={styles.crownImageTop1}
            />

            {/* Text section */}
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={[styles.nameText, { color: "#a3a3a3", fontSize: 20 }]}
                numberOfLines={1}
              >
                {postsData1?.[0]?.title}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text
                  style={[styles.levelText, { color: "#a3a3a3", fontSize: 20, }]}
                >
                  {formatNumberShort(postsData1?.[0]?.scores)}
                </Text>
                <MaterialIcons name="local-fire-department" size={26} color="red" />
              </View>
            </View>
          </View>
          {/* )} */}
        </TouchableOpacity>

        {/* top 3 */}
        <TouchableOpacity
          style={styles.rankContainer}
          onPress={() =>
            router.push({
              pathname: "/postDetail",
              params: {
                postId: postsData1?.[2]?.id
              },
            })
          }
        >
          <View style={styles.wrapTopTrending}>
            {/* Image section */}
            <View
              style={[
                styles.rankCircle,
              ]}
            >
              <View style={styles.rankImageContainer}>
                <Image
                  source={{
                    uri: postsData1?.[2]?.thumbnail ?? "https://mediatech.vn/assets/images/imgstd.jpg",
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
            <LottieView
              source={require("@/assets/images/bronze_crown.json")}
              loop
              autoPlay
              style={styles.crownImageTop3}
            />
            {/* Text section */}
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={[styles.nameText,]}
                numberOfLines={1}
              >
                {postsData1?.[2]?.title}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text
                  style={[styles.levelText,]}
                >
                  {formatNumberShort(postsData1?.[2]?.scores)}
                </Text>
                <MaterialIcons name="local-fire-department" size={20} color="red" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* danh sách các hạng còn lại */}
      <View style={{ backgroundColor: backgroundColors.background2, flex: 1, padding: 10, paddingBottom: 70 }}>
        <FlatList
          data={postsData1.slice(3)}
          // contentContainerStyle={{ backgroundColor: backgroundColors.background2, paddingHorizontal: 10 }}
          scrollEnabled={true}
          ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/postDetail",
                  params: { postId: item.id },
                })
              }
            >
              <Text style={styles.rankNumber}>#
                {(index + 4).toString().padStart(2, " ")}
                {/* {(index + 4).toString()} */}
              </Text>
              <Image
                source={{
                  uri: item.thumbnail ??
                    "https://mediatech.vn/assets/images/imgstd.jpg",
                }}
                style={styles.rankImageSmall}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.rankName} numberOfLines={1}>
                  {/* {isCity(item) ? item.name : (item.title.length > 25 ? `${item.title.slice(0, 25)}...` : item.title)} */}
                  {item.title}
                </Text>
                {/* {!isCity(item) && (
                      <Text style={styles.dateText}>
                        {formatDate(item.created_at)}
                      </Text>
                    )} */}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.rankScore}>
                  {formatNumberShort(item?.scores)}
                </Text>
                <MaterialIcons name="local-fire-department" size={18} color="#ff6128" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

    </View>
  )
}

export default PostTrending

const styles = StyleSheet.create({
  wrapTopTrending: {
    // justifyContent:'center',
    alignItems: 'center'
  },
  /** info container */
  infoContainer: {
    flex: 1,
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
    width: 50,
    // marginRight: 20,
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
  /** tên và score */
  nameText: {
    // width:50,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#a3a3a3",
    textShadowColor: "#444444",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  levelText: {
    fontSize: 15,
    color: "#a3a3a3",
    textShadowColor: "#444444",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 1,
  },
  /**  ảnh rank */
  rankImageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    overflow: "hidden",
    zIndex: 4
  },
  // rankImageContainerBig: {
  //   width: "100%",
  //   height: "100%",
  //   borderRadius: 50,
  //   overflow: "hidden",
  //   zIndex: 4
  // },

  /** ảnh full */
  rankImageFill: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    zIndex: 5
  },
  // rankImageFillBig: {
  //   width: "100%",
  //   height: "100%",
  //   resizeMode: "cover",
  //   zIndex: 5
  // },

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
    zIndex: 4,
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
    zIndex: 4,
  },
  rankNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  rankCircle: {
    borderColor: "#FF8228",
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    zIndex: 2
  },
  rankCircleMedium: {
    width: 90,
    height: 90,
    borderColor: "#AAAAAA",
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 2,
  },

  rankCircleBig: {
    width: 105,
    height: 105,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderColor: "#FFCA28",
    zIndex: 2
  },
  topRanking: {
    flexDirection: 'row',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: "flex-end",
    gap: 10
  },

  rankContainer: {
    flex: 1,
    // backgroundColor: 'red'
  },
  /** ảnh crown */
  crownImageTop1: {
    position: "absolute",
    top: '-40%',
    width: 105,
    height: 105,
    resizeMode: "contain",
  },
  crownImageTop2: {
    position: "absolute",
    top: -42,
    left: -10,
    width: 80,
    height: 80,
    resizeMode: "contain",
    transform: [{ rotate: "-30deg" }],
  },
  crownImageTop3: {
    // backgroundColor:'green',
    position: "absolute",
    top: '-32%',
    left: 42,
    width: 83,
    height: 83,
    resizeMode: "contain",
    transform: [{ rotate: "30deg" }],
  },
})