import { View, Text } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database';
import { database } from '@/firebase/firebaseConfig';

// Định nghĩa kiểu cho context
// interface HomeContextType {
//     dataPosts: any[]; // Bạn có thể thay thế `any[]` bằng kiểu chính xác nếu biết
// }

// Tạo giá trị mặc định cho context
// const defaultContextValue: HomeContextType = {
//     dataPosts: [], // Giá trị mặc định cho dataPosts
// };
const HomeContext = createContext();
const HomeProvider = ({children}) => {
    const [dataPosts, setDataPosts] = useState([])
    
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

            }}

        >
            {children}
        </HomeContext.Provider>
    )
}

export const useHomeProvider = () => useContext(HomeContext);

export default HomeProvider