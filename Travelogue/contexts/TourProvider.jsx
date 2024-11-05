import { View, Text } from 'react-native'
import React, { createContext, useState } from 'react'
import { useContext } from 'react'

const TourContext = createContext(null)
const TourProvider = ({ children }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [dataTours, setDataTours] = useState([]);
    const [dataModalSelected, setDataModalSelected] = useState(null)
    const [currentTourCount, setCurrentTourCount] = useState(0);
    const [newTourCount, setNewTourCount] = useState(0);
    const [isSearchingMode, setIsSearchingMode] = useState(false)
    const [loadedTours, setLoadedTours] = useState(false)

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