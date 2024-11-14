import { View, Text, AppState } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import { auth, database, get } from '@/firebase/firebaseConfig';
import { slug, sortTourAtHomeScreen } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageEmitter } from '@/utils/emitter';
// Định nghĩa kiểu cho context
// interface HomeContextType {=
//     dataPosts: any[]; // Bạn có thể thay thế `any[]` bằng kiểu chính xác nếu biết
// }

// Tạo giá trị mặc định cho context
// const defaultContextValue: HomeContextType = {
//     dataPosts: [], // Giá trị mặc định cho dataPosts
// };
const HomeContext = createContext(null);
const HomeProvider = ({ children }) => {
    const [isFocus, setIsFocus] = useState(false)
    const [dataAccount, setDataAccount] = useState(null)
    const [dataCountries, setDataCountries] = useState([])
    const [dataAllCities, setDataAllCities] = useState([])
    const [loadedDataAccount, setLoadedDataAccount] = useState(false)
    const [dataPosts, setDataPosts] = useState([])
    const dataPostsRef = useRef([])
    const [dataTours, setDataTours] = useState([])
    const [postIdCurrent, setPostIdCurrent] = useState(-1);
    // Mảng chứa id tất cả location theo từng bài viết
    const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
    const [allLocationNameFromPost, setAllLocationNameFromPost] = useState([])
    const [refreshingPost, setRefreshingPost] = useState(false);
    const [loadedPosts, setLoadedPosts] = useState(false)
    const [loadedTours, setLoadedTours] = useState(false)
    const [notifyNewPost, setNotifyNewPost] = useState(false)
    const appStateRef = useRef(AppState.currentState)
    const [currentPostCount, setCurrentPostCount] = useState(0);
    const [newPostCount, setNewPostCount] = useState(0);
    // const [searching, setSearching] = useState(false)
    const [accountBehavior, setAccountBehavior] = useState({})
    const [userId, setUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSearchingMode, setIsSearchingMode] = useState(false)
    const [dataModalSelected, setDataModalSelected] = useState(null)

    // Login state
    const fetchUserId = async () => {
        const userToken = await AsyncStorage.getItem("userToken");
        setUserId(userToken);
    };

    useEffect(() => {
        // Fetch initial value
        fetchUserId();

        // Listen for changes
        asyncStorageEmitter.on("userTokenChanged", fetchUserId);

        // Cleanup the event listener on unmount
        return () => {
            asyncStorageEmitter.off("userTokenChanged", fetchUserId);
        };
    }, []);
    
    /// App state ý tưởng khi vòa lại app thì reset behavior
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async nextAppState => {
            console.log('Trạng thái AppState trước khi thay đổi:', appStateRef.current);
            console.log('Trạng thái AppState mới:', nextAppState);

            // Lưu trạng thái hiện tại vào AsyncStorage trước khi cập nhật
            await AsyncStorage.setItem("APP_STATE", nextAppState)
            // appStateRef.current = nextAppState;
            // setAppState(appState.current);     
            try {
                const value = await AsyncStorage.getItem("APP_STATE");
                if (value !== null) {
                    console.log('Giá trị đọc được từ AsyncStorage:', value);
                    // Xử lý giá trị đọc được (convert từ JSON nếu cần)
                } else {
                    console.log('Không có dữ liệu');
                }
            } catch (e) {
                console.error('Lỗi khi đọc dữ liệu từ AsyncStorage:', e);
            }

            // console.log('AppState: ', await AsyncStorage.getItem("APP_STATE"));
        });

        return () => {
            subscription.remove();
        };
    }, [])

    /// ------------------------ FETCH NO REALTIME --------------------------
    // Fetch tour theo post không realtime
    useEffect(() => {
        // if (loadedDataAccount) {
        const fetchData = async () => {
            try {
                const refTours = ref(database, 'tours/')
                const toursQuery = query(refTours, orderByChild('view_mode'), equalTo(true));
                const snapshot = await get(toursQuery);
                if (snapshot.exists()) {
                    const dataToursJson = snapshot.val()
                    const dataToursArray = Object.values(dataToursJson) // Array all tours from firebase
                    // Sắp xếp lại list tour theo thứ tự
                    sortTourAtHomeScreen(dataToursArray, allLocationIdFromPost)
                    setDataTours(dataToursArray)
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
        fetchData();
        // }
        // không gọi lại hàm nếu 2 tour kế tiếp có địa điểm giống nhau
    }, [postIdCurrent, allLocationIdFromPost])// --------- END FETCH NO REAL TIME--------

    /// ----------------------- FETCH REAL TIME ----------------------
    // Lấy các thành phố
    useEffect(() => {
        const refCities = ref(database, `cities/`)
        const unsubscribe = onValue(refCities, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataCities = snapshot.val();
                const result = Object.entries(jsonDataCities).flatMap(([country, regions]) =>
                    Object.entries(regions).flatMap(([region, cityObj]) =>
                        Object.entries(cityObj).map(([cityCode, cityInfo]) =>
                        ({
                            [cityCode]: cityInfo.name
                        })
                        )
                    )
                );

                setDataAllCities(result);
            } else {
                console.log("No data available1");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])
    // Lấy các quốc gia 
    useEffect(() => {
        const refCountries = ref(database, `countries`)
        const unsubscribe = onValue(refCountries, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataCountries = snapshot.val();
                const countriesArray = Object.keys(jsonDataCountries).map(key => ({
                    key,
                    value: jsonDataCountries[key].label,
                }));
                setDataCountries(countriesArray)
                // setAccountBehavior(jsonDataAccount.behavior)
                // Set du lieu
                // setDataAccount(jsonDataAccount)
                // setLoadedDataAccount(true)
            } else {
                console.log("No data available1");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])
    // Lấy data account
    useEffect(() => {
        if (userId) {
            const refAccount = ref(database, `accounts/${userId}`)
            const unsubscribe = onValue(refAccount, (snapshot) => {
                if (snapshot.exists()) {
                    const jsonDataAccount = snapshot.val();
                    // Set behavior
                    console.log(jsonDataAccount.behavior);
                    setAccountBehavior(jsonDataAccount.behavior)
                    setDataAccount(jsonDataAccount)
                    setLoadedDataAccount(true)
                } else {
                    console.log("No data available1");
                }
            }, (error) => {
                console.error("Error fetching data:", error);
            });

            return () => {
                unsubscribe(); // Sử dụng unsubscribe để hủy listener
            };
        }
    }, [userId])
    // Hàm lắng nghe thay khi có bài viết mới từ firebase để hiển thị button reload
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refPosts = ref(database, 'posts/')
        const postsQuery = query(refPosts, orderByChild('view_mode'), equalTo(true));
        const unsubscribe = onValue(postsQuery, (snapshot) => {
            if (snapshot.exists()) {
                const countNewPost = snapshot.size;
                setNewPostCount(countNewPost)
            } else {
                console.log("No data available");
            }
            // setLoadingPost(false)
        }, (error) => {
            console.error("Error fetching data:", error);
            // setLoadingPost(false)
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])
    return (
        <HomeContext.Provider
            value={{
                dataPosts,
                dataTours,
                refreshingPost,
                notifyNewPost,
                dataPostsRef,
                currentPostCount,
                allLocationIdFromPost,
                newPostCount,
                accountBehavior,
                loadedDataAccount,
                loadedPosts,
                loadedTours,
                modalVisible,
                dataCountries,
                isSearchingMode,
                dataModalSelected,
                dataAllCities,
                dataAccount, setDataAccount,
                isFocus, setIsFocus,
                userId, setUserId,
                setDataAllCities,
                setDataModalSelected,
                setIsSearchingMode,
                setDataCountries,
                setModalVisible,
                setLoadedPosts,
                setLoadedTours,
                setLoadedDataAccount,
                setAccountBehavior,
                setCurrentPostCount,
                setDataPosts,
                setAllLocationIdFromPost,
                setAllLocationNameFromPost,
                setPostIdCurrent,
                setRefreshingPost,
                dataAccount
            }}

        >
            {children}
        </HomeContext.Provider>
    )
}

export const useHomeProvider = () => useContext(HomeContext);

export default HomeProvider