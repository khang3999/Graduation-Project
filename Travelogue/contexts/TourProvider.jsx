import { View, Text } from 'react-native'
import React, { createContext, useEffect, useRef, useState } from 'react'
import { useContext } from 'react'
import { equalTo, orderByChild, query, ref } from 'firebase/database'
import { database, onValue } from '@/firebase/firebaseConfig'

const TourContext = createContext(null)
const TourProvider = ({ children }) => {
    const [dataTours, setDataTours] = useState([]);
    const [dataModalSelected, setDataModalSelected] = useState(null)
    const [currentTourCount, setCurrentTourCount] = useState(0);
    const [newTourCount, setNewTourCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false)
    const [loadedTours, setLoadedTours] = useState(false)
    const [showBanner, setShowBanner] = useState(true);
    const [modalSearchVisible, setModalSearchVisible] = useState(false)
    const [reload, setReload] = useState(false);
    const [search, setSearch] = useState(false);
    const [modalNewTourVisible, setModalNewTourVisible] = useState(false);
    const dataInput = useRef('')
    const selectedCountry = useRef(null)
    const [selectedCities, setSelectedCities] = useState([]);
    const [dataCities, setDataCities] = useState([])






    // const [selectedTypeSearch, setSelectedTypeSearch] = useState(1);

    const [selectedTour, setSelectedTour] = useState(undefined)
    const [dataNewTourList, setDataNewTourList] = useState([])
    const dataTypeSearch = [
        { key: 1, value: 'Mặc định' },
        { key: 2, value: 'Thích nhiều nhất' },
        { key: 3, value: 'Đánh giá tốt nhất' }
    ]
    const selectedTypeSearch = useRef(1)

    // Hàm lắng nghe thay khi có tour mới từ firebase để hiển thị button reload
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng tours
        const refTours = ref(database, 'tours/')
        const toursQuery = query(refTours, orderByChild('status_id'), equalTo(1));
        const unsubscribe = onValue(toursQuery, (snapshot) => {
            if (snapshot.exists()) {
                const countNewTour = snapshot.size;
                const dataNewToursJson = snapshot.val()
                setNewTourCount(countNewTour)
                // Lấy bài viết mới
                const dataNewToursArray = Object.values(dataNewToursJson)
                setDataNewTourList(dataNewToursArray)
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
                dataTours, setDataTours,
                dataModalSelected, setDataModalSelected,
                currentTourCount, setCurrentTourCount,
                newTourCount, setNewTourCount,
                loadedTours, setLoadedTours,
                setSelectedTour, selectedTour,
                // selectedTypeSearch, setSelectedTypeSearch,
                selectedTypeSearch,
                dataNewTourList, setDataNewTourList,
                dataTypeSearch,
                showBanner, setShowBanner,
                modalSearchVisible, setModalSearchVisible,
                reload, setReload,
                modalNewTourVisible, setModalNewTourVisible,
                isLoading, setIsLoading,
                dataInput,
                selectedCountry,
                search, setSearch,
                selectedCities, setSelectedCities,
                dataCities, setDataCities
            }}
        >
            {children}
        </TourContext.Provider>
    )
}
export const useTourProvider = () => useContext(TourContext)
export default TourProvider