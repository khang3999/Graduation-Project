import { View, Text } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database';
import { auth, database, get } from '@/firebase/firebaseConfig';
import { slug, sortTour } from '@/utils';
// Định nghĩa kiểu cho context
// interface HomeContextType {=
//     dataPosts: any[]; // Bạn có thể thay thế `any[]` bằng kiểu chính xác nếu biết
// }

// Tạo giá trị mặc định cho context
// const defaultContextValue: HomeContextType = {
//     dataPosts: [], // Giá trị mặc định cho dataPosts
// };
const HomeContext = createContext();
const HomeProvider = ({ children }) => {
    const [dataAccount, setDataAccount] = useState(null)
    const [dataPosts, setDataPosts] = useState([])
    const [dataTours, setDataTours] = useState([])
    const [dataFactorsPost, setDataFactorsPost] = useState(null)
    const [postIdCurrent, setPostIdCurrent] = useState(-1);
    // Mảng chứa id tất cả location theo từng bài viết
    const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
    const [allLocationNameFromPost, setAllLocationNameFromPost] = useState([])
    const [refreshingPost, setRefreshingPost] = useState(false);
    const [loadingPost, setLoadingPost] = useState(true)
    const [loadingTour, setLoadingTour] = useState(true)
    const [notifyNewPost, setNotifyNewPost] = useState(false)

    /// ------------------------ FUNCTION -------------------
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


    // // Hàm tính điểm tổng
    // const calculateTourPoint = (tour, factorsPost) => {
    //     // Tinh diem luot like
    //     const likes = tour.likes
    //     const objLike = factorsPost.like.detail
    //     const likePoint = getPointByQuantity(likes, objLike)

    //     // Tinh diem luot comment
    //     const comments = tour.comments.quantity
    //     const objComment = factorsPost.comment.detail
    //     const commentPoint = getPointByQuantity(comments, objComment)

    //     // Tính điểm rating
    //     const ratingPoint = tour.rating >= 3 ? 1 : 0

    //     // Tính điểm gói sử dụng
    //     const pricePackagePoint = tour.package.factor

    //     // Tinh điểm theo match hành vi cần mảng location name và location id (lưu global)
    //     const locations = tour.locations
    //     const allLocationNamesOfTour = Object.keys(locations).flatMap((country) => // ["Ha noi","Cao bang"] cua tour
    //         Object.values(locations[country])
    //     );
    //     const contentPost = tour.content + "-" + allLocationNamesOfTour.join('-')

    //     const locationsIdOfTour = Object.keys(tour.locations).flatMap((country) =>
    //         Object.keys(locations[country])
    //     );
    //     console.log(locationsIdOfTour);


    //     const behaviorPoint = calculateByContentAndLocation(dataAccount, contentPost, locationsIdOfTour, dataFactorsPost)
    //     console.log(behaviorPoint);

    //     const mark = likePoint + commentPoint + ratingPoint + pricePackagePoint + behaviorPoint
    //     console.log(mark);
    //     return mark
    // } // ------------------------ END FUNCTION --------------------------

    /// ------------------------ FETCH NO REALTIME --------------------------
    // Fetch không realtime
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
    // Lấy factor dùng cho tính điểm bài viết (dùng chung cho tour)
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refFactorsPost = ref(database, 'factors/post')
        const unsubscribe = onValue(refFactorsPost, (snapshot) => {
            if (snapshot.exists()) {
                // Lấy tất cả factor của post dùng cho tính điểm
                const jsonDataFactosrPost = snapshot.val();
                // Set du lieu
                setDataFactorsPost(jsonDataFactosrPost)
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
    // Lấy bài viết
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refPosts = ref(database, 'posts/')
        const unsubscribe = onValue(refPosts, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataPosts = snapshot.val();
                // Chuyển đổi object thành array bang values cua js
                const jsonArrayPosts = Object.values(jsonDataPosts).sort((a, b) => b.created_at - a.created_at)
                setNotifyNewPost(true)
                // Set du lieu
                setDataPosts(jsonArrayPosts)
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