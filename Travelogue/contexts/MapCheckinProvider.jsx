import { View, Text } from 'react-native'
import React, { createContext, useContext, useState } from 'react'

const MapCheckinContext = createContext(null);
const MapCheckinProvider = ({ children }) => {
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [dataCheckedCities, setDataCheckedCities] = useState([])
  const checkedCityColor = 'green'

  return (
    <MapCheckinContext.Provider
      value={{
        checkedCityColor,
        selectedCityId, setSelectedCityId,
        dataCheckedCities, setDataCheckedCities,
      }}
    >
      {children}
    </MapCheckinContext.Provider >
  )
}

export const useMapCheckinProvider = () => useContext(MapCheckinContext)

export default MapCheckinProvider