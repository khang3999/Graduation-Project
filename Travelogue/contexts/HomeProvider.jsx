import { View, Text } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database';
import { auth, database, get } from '@/firebase/firebaseConfig';

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

    /// ------------------------ FUNCTION -------------------
    // HÀM TÍNH ĐIỂM MỚI NHẤT DÙNG CHO TOUR
    // Input: 1. Bài viết hiện tại
    //        2. Từng tour trong danh sách
    //        3. Hệ số: match > factor of post's price > rating > like > date
    //                  + match: Lấy 
    const calculatePointForTour = () =>{
        
        return a
    }



    // Hàm slug text
    const slug = (str) => {
        return String(str)
            .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')  //Xóa dấu
            .trim().toLowerCase() //Cắt khoảng trắng đầu, cuối và chuyển chữ thường
            .replace(/[^a-z0-9\s-]/g, '') //Xóa ký tự đặc biệt
            .replace(/[\s-]+/g, '-') //Thay khoảng trắng bằng dấu -, ko cho 2 -- liên tục
    }

    // Lấy tour theo bài viết khi có bài viết mới được hiển thị 
    // Thứ tự: Chủ đề -> Tính điểm tour (Hành vi -> Độ ưu tiên khi chọn giá đăng tour -> like = comment -> rating )

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


    // Hàm để đếm số lượng địa điểm trùng khớp 
    const countMatchingLocations = (tourLocations, allLocationIdOfPost) => {
        // console.log(tourLocations);
        const locationIds = Object.keys(tourLocations).flatMap((country) =>
            Object.keys(tourLocations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
        );
        return locationIds.filter(id => allLocationIdOfPost.includes(id)).length;
    };

    // Hàm tính điểm để ưu tiên hiển thị tour t
    // Với hành vi a: 68% gồm location và content khi search
    // Giá gói b: từ 12% -> 21% tùy vào gói
    // Comment c, lượt like d = 4% (Tổng 8%), rating e: 3% 
    const getPointByQuantity = (number, detailObject) => { // Ham tinh diem theo luot like và comment
        for (let index = 0; index < detailObject.length; index++) {
            if (number < detailObject[index]) {
                return index
            }
        }
        return 4 // đạt điểm tối đa
    }
    // Hàm tính điểm tổng
    const calculateTourPoint = (tour, factorsPost) => {
        // Tinh diem luot like
        const likes = tour.likes
        const objLike = factorsPost.like.detail
        const likePoint = getPointByQuantity(likes, objLike)

        // Tinh diem luot comment
        const comments = tour.comments.quantity
        const objComment = factorsPost.comment.detail
        const commentPoint = getPointByQuantity(comments, objComment)

        // Tính điểm rating
        const ratingPoint = tour.rating >= 3 ? 1 : 0

        // Tính điểm gói sử dụng
        const pricePackagePoint =  tour.package.factor

        // Tinh điểm theo match hành vi cần mảng location name và location id (lưu global)
        const locations = tour.locations
        const allLocationNamesOfTour = Object.keys(locations).flatMap((country) => // ["Ha noi","Cao bang"] cua tour
            Object.values(locations[country])
        );
        const contentPost = tour.content + "-" + allLocationNamesOfTour.join('-')

        const locationsIdOfTour = Object.keys(tour.locations).flatMap((country) =>
            Object.keys(locations[country])
        );
        console.log(locationsIdOfTour);


        const behaviorPoint = calculateByContentAndLocation(dataAccount,contentPost,locationsIdOfTour, dataFactorsPost)
        console.log(behaviorPoint);
        
        const mark = likePoint + commentPoint + ratingPoint + pricePackagePoint + behaviorPoint
        console.log(mark);
        return mark
    } // ------------------------ END FUNCTION --------------------------

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
                    // Sắp xếp tours dựa trên số lượng địa điểm trùng khớp
                    const sortedTours = dataToursArray.sort((tourA, tourB) => {
                        const matchesA = countMatchingLocations(tourA.locations, allLocationIdFromPost);
                        const matchesB = countMatchingLocations(tourB.locations, allLocationIdFromPost);

                        // Số lượng trùng địa điểm theo bài viết bằng nhau thì phải tính điểm tour để sắp xếp
                        if (matchesA == matchesB) {
                            console.log(calculateTourPoint(tourA, dataFactorsPost));

                            return calculateTourPoint(tourA, dataFactorsPost) - calculateTourPoint(tourB, dataFactorsPost)
                        }
                        return matchesB - matchesA; // Sắp xếp giảm dần theo số lượng trùng khớp
                    });
                    setDataTours(sortedTours)
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
        fetchData();
    }, [postIdCurrent, allLocationIdFromPost])// ----------------- END FETCH NO REAL TIME ---------------------

    /// ----------------------- FETCH REAL TIME ----------------------
    // Lấy data account
    useEffect(() => {
        const userId = auth.currentUser?.uid; // Lấy id user đang đăng nhập
        console.log(userId);
        const refAccount = ref(database, `accounts/${userId}`)
        const unsubscribe = onValue(refAccount, (snapshot) => {
            if (snapshot.exists()) {
                // Lấy tất cả factor của post dùng cho tính điểm
                const jsonDataAccount = snapshot.val();
                // Set du lieu
                console.log(jsonDataAccount);
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
                // Set du lieu
                setDataPosts(jsonArrayPosts)
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
    return (
        <HomeContext.Provider
            value={{
                dataPosts,
                dataTours,
                refreshingPost,
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