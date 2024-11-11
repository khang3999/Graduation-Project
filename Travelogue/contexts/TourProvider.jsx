import { View, Text } from 'react-native'
import React, { createContext, useEffect, useState } from 'react'
import { useContext } from 'react'
import { equalTo, orderByChild, query, ref } from 'firebase/database'
import { database, onValue } from '@/firebase/firebaseConfig'

const TourContext = createContext(null)
const TourProvider = ({ children }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [dataTours, setDataTours] = useState([]);
    const [dataModalSelected, setDataModalSelected] = useState(null)
    const [currentTourCount, setCurrentTourCount] = useState(0);
    const [newTourCount, setNewTourCount] = useState(0);
    const [isSearchingMode, setIsSearchingMode] = useState(false)
    const [loadedTours, setLoadedTours] = useState(false)

    // Hàm lắng nghe thay khi có tour mới từ firebase để hiển thị button reload
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng tours
        const refTours = ref(database, 'tours/')
        const toursQuery = query(refTours, orderByChild('view_mode'), equalTo(true));
        const unsubscribe = onValue (toursQuery, (snapshot) => {
            if (snapshot.exists()) {
                const countNewTour = snapshot.size;
                setNewTourCount(countNewTour)
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
        <TourContext.Provider
            value={{
                modalVisible, setModalVisible,
                dataTours, setDataTours,
                dataModalSelected, setDataModalSelected,
                currentTourCount, setCurrentTourCount,
                newTourCount, setNewTourCount,
                loadedTours, setLoadedTours,
                isSearchingMode, setIsSearchingMode
            }}
        >
            {children}
        </TourContext.Provider>
    )
}
export const useTourProvider = () => useContext(TourContext)
export default TourProvider