import { View, Text, AppState } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { onValue, ref } from 'firebase/database';
import { auth, database, get } from '@/firebase/firebaseConfig';
import { slug, sortTour } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const [dataAccount, setDataAccount] = useState(null)
    const [dataPosts, setDataPosts] = useState([])
    const dataPostsRef = useRef([])
    const [dataTours, setDataTours] = useState([])
    const [postIdCurrent, setPostIdCurrent] = useState(-1);
    // Mảng chứa id tất cả location theo từng bài viết
    const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
    const [allLocationNameFromPost, setAllLocationNameFromPost] = useState([])
    const [refreshingPost, setRefreshingPost] = useState(false);
    const [loadingPost, setLoadingPost] = useState(true)
    const [loadingTour, setLoadingTour] = useState(true)
    const [notifyNewPost, setNotifyNewPost] = useState(false)
    const appStateRef = useRef(AppState.currentState)
    const [currentPostCount, setCurrentPostCount] = useState(0);
    const [newPostCount, setNewPostCount] = useState(0);
    const [searching, setSearching] = useState(false)
    const [behavior, setBehavior] = useState({})

    /// App state
    // useEffect(() => {
    //     console.log('Trạng thái AppState ban đầu:', AppState.currentState);
    // }, []);
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

    /// ------------------------ FUNCTION -------------------
    // Hàm set lại dữ liệu get được từ firebase được gọi mỗi khi mở app và khi có thay đổi từ firebase và bấm vào button reload 


    // Hàm set lại behavior mỗi khi vào lại app
    // useEffect(() => {
    //     if (appState == AppState.ac) {

    //     }
    // }, [appState])
    // Hàm thực hiện sort list khi load lại dữ liệu mới


    // Hàm tính điểm hành vi cho tour(hoặc bài viết theo content và location)
    // ****** Cần reset behavior sau mỗi phiên đăng nhập *********
    const calculateByContentAndLocation = (account, content, locationsIdOfTour, dataFactorsPost) => {
        // Có nhiều cách so sánh
        // 1. lau-ga tìm trong 'Hom-nay-di-an-lau-ga'
        const maxPoint = dataFactorsPost.behavior
        const behaviorSlug = slug(account.behavior.content)
        const contentSlug = slug(content)
        const locationId = account.behavior.location
        if (contentSlug.includes(behaviorSlug) && locationsIdOfTour.includes(locationId)) {
            return maxPoint
        } else if (contentSlug.includes(behaviorSlug) || locationsIdOfTour.includes(locationId)) {
            return maxPoint / 2
        }
        return 0
        // 2. [lẩu, gà] tìm trong " Hôm nay đi ăn lẩu, có bò heo gà"
    }
    // } // ------------------------ END FUNCTION --------------------------

    /// ------------------------ FETCH NO REALTIME --------------------------
    // Fetch tour theo post không realtime
    useEffect(() => {
        const fetchData = async () => {
            try {
                const refTours = ref(database, 'tours/')
                const snapshot = await get(refTours);
                if (snapshot.exists()) {
                    const dataToursJson = snapshot.val()
                    const dataToursArray = Object.values(dataToursJson) // Array all tours from firebase
                    // Sắp xếp lại list tour theo thứ tự
                    const sortedTours = sortTour(dataToursArray, allLocationIdFromPost)
                    setDataTours(sortedTours)
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
        fetchData();
        // không gọi lại hàm nếu 2 tour kế tiếp có địa điểm giống nhau
    }, [postIdCurrent, allLocationIdFromPost])// --------- END FETCH NO REAL TIME--------

    /// ----------------------- FETCH REAL TIME ----------------------
    // Lấy data account
    useEffect(() => {
        const userId = auth.currentUser?.uid; // Lấy id user đang đăng nhập
        const refAccount = ref(database, `accounts/${userId}`)
        const unsubscribe = onValue(refAccount, (snapshot) => {
            if (snapshot.exists()) {
                // Lấy tất cả factor của post dùng cho tính điểm
                const jsonDataAccount = snapshot.val();
                // Set behavior
                setBehavior(jsonDataAccount.behavior)
                // Set du lieu
                setDataAccount(jsonDataAccount)
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])

    // Hàm lắng nghe thay khi có bài viết mới từ firebase để hiển thị button reload
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refPosts = ref(database, 'posts/')
        const unsubscribe = onValue(refPosts, (snapshot) => {
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
                loadingPost,
                loadingTour,
                notifyNewPost,
                dataPostsRef,
                currentPostCount,
                newPostCount,
                searching, 
                behavior,
                setBehavior,
                setSearching,
                setCurrentPostCount,
                setDataPosts,
                setLoadingPost,
                setLoadingTour,
                setAllLocationIdFromPost,
                setAllLocationNameFromPost,
                setPostIdCurrent,
                setRefreshingPost
            }}

        >
            {children}
        </HomeContext.Provider>
    )
}

export const useHomeProvider = () => useContext(HomeContext);

export default HomeProvider