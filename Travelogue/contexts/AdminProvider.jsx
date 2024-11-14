import { View, Text } from 'react-native'
import React, {createContext, useState} from 'react'

const AdminContext = createContext(undefined)
const AdminProvider = ({children}) => {
const [postArr, setPostArr] = useState([])
  return (
   <AdminContext.Provider 
   value={{
    postArr, setPostArr
   }}>
    {children}
   </AdminContext.Provider>
  )
}
export const useAdminProvider = ()=>  useContext(AdminContext);
export default AdminProvider