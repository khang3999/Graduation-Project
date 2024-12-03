import { View, Text } from 'react-native'
import React, {createContext, useContext, useState} from 'react'

const AdminContext = createContext(undefined)
const AdminProvider = ({children}) => {
const [postArr, setPostArr] = useState([])
const [imagesReport, setImagesReport] = useState([])
  return (
   <AdminContext.Provider 
   value={{
    postArr, setPostArr,
    imagesReport, setImagesReport
   }}>
    {children}
   </AdminContext.Provider>
  )
}
export const useAdminProvider = () =>  useContext(AdminContext);
export default AdminProvider