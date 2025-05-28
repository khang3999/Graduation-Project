import { View, Text, AppState } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import { auth, database, get } from '@/firebase/firebaseConfig';
import { slug, sortTourAtHomeScreen } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageEmitter } from '@/utils/emitter';
// import { useAccount } from './AccountProvider';

const HomeContext = createContext(null);
const HomeProvider = ({ children }) => {
    const [dataAccount, setDataAccount] = useState(null)
    const [dataCountries, setDataCountries] = useState([])
    const [dataAllCities, setDataAllCities] = useState([])
    const [dataPosts, setDataPosts] = useState([])
    const [accountBehavior, setAccountBehavior] = useState(null)
    const dataTours = useRef([])
    // Mảng chứa id tất cả location theo từng bài viết
    const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
    const [loadedPosts, setLoadedPosts] = useState(false)
    const [loadedTours, setLoadedTours] = useState(false)
    const [currentPostCount, setCurrentPostCount] = useState(0);
    const [newPostCount, setNewPostCount] = useState(0);
    // const [searching, setSearching] = useState(false)
    const [userId, setUserId] = useState(null);
    // Modal search
    const [modalSearchVisible, setModalSearchVisible] = useState(false);
    const dataInput = useRef('')
    const selectedCountry = useRef(null)
    const [dataCities, setDataCities] = useState([])
    const [selectedCities, setSelectedCities] = useState([]);
    const selectedTypeSearch = useRef(1)
    const dataTypeSearch = [
        { key: 1, value: 'Mặc định' },
        { key: 2, value: 'Thích nhiều nhất' }
    ]
    // Modal new post
    const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
    // const [isSearchingMode, setIsSearchingMode] = useState(false)
    const [dataModalSelected, setDataModalSelected] = useState(null)
    const [dataNewPostList, setDataNewPostList] = useState([])
    const [dataToursSorted, setDataToursSorted] = useState([])
    const [reload, setReload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(false);

    // const { setAccountData } = useAccount();

    // Login state
    const fetchUserId = async () => {
        const userToken = await AsyncStorage.getItem("userToken");
        setUserId(userToken);
    };

    useEffect(() => {
        // Fetch initial value
        fetchUserId();

        // Listen for changes
        asyncStorageEmitter.on("userTokenChanged", fetchUserId);

        // Cleanup the event listener on unmount
        return () => {
            asyncStorageEmitter.off("userTokenChanged", fetchUserId);
        };
    }, []);

    /// ----------------------- FETCH REAL TIME ----------------------

    // Lấy các thành phố
    useEffect(() => {
        const refCities = ref(database, `cities/`)
        const unsubscribe = onValue(refCities, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataCities = snapshot.val();
                const result = Object.entries(jsonDataCities).flatMap(([country, regions]) =>
                    Object.entries(regions).flatMap(([region, cityObj]) =>
                        Object.entries(cityObj).map(([cityCode, cityInfo]) =>
                        ({
                            [cityCode]: cityInfo.name
                        })
                        )
                    )
                );

                setDataAllCities(result);
            } else {
                console.log("No data available1");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])
    // Lấy các quốc gia 
    useEffect(() => {
        const refCountries = ref(database, `countries`)
        const unsubscribe = onValue(refCountries, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataCountries = snapshot.val();
                const countriesArray = Object.keys(jsonDataCountries).map(key => ({
                    key,
                    value: jsonDataCountries[key].label,
                }));
                setDataCountries(countriesArray)
            } else {
                console.log("No data available1");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])

    // // Lấy các bài viết đã like
    // useEffect(() => {
    //     const refLikedSaved = ref(database, `accounts/${userId}`)
    //     const unsubscribe = onValue(refLikedSaved, (snapshot) => {
    //         if (snapshot.exists()) {
    //             const jsonData = snapshot.val();
    //             // POST
    //             const likedPostsList = jsonData.likedPostsList || {};
    //             const savedPostsList = jsonData.savedPostsList || {};
    //             // TOUR
    //             const likedToursList = jsonData.likedToursList || {};
    //             const savedToursList = jsonData.savedToursList || {};


    //         } else {
    //             console.log("No data available liked list and saved list");
    //         }
    //     }, (error) => {
    //         console.error("Error fetching liked list and saved list:", error);
    //     });

    //     return () => {
    //         unsubscribe(); // Sử dụng unsubscribe để hủy listener
    //     };
    // }, [userId])

    // Lấy data account
    // useEffect(() => {
    //     if (userId) {
    //         const refAccount = ref(database, `accounts/${userId}`)
    //         const unsubscribe = onValue(refAccount, (snapshot) => {
    //             console.log('check data account');
    //             if (snapshot.exists()) {
    //                 const jsonDataAccount = snapshot.val();
    //                 // POST
    //                 const likedPostsList = jsonDataAccount.likedPostsList || {};
    //                 const savedPostsList = jsonDataAccount.savedPostsList || {};
    //                 // TOUR
    //                 const likedToursList = jsonDataAccount.likedToursList || {};
    //                 const savedToursList = jsonDataAccount.savedToursList || {};
    //                 // Set behavior
    //                 setDataAccount(jsonDataAccount) // use at postDetail.jsx
    //                 // setAccountData(jsonDataAccount) //account provider
    //             } else {
    //                 console.log("No data available1");
    //             }
    //         }, (error) => {
    //             console.log("check 999:");
    //             console.error("Error fetching data:", error);
    //         });

    //         return () => {
    //             unsubscribe(); // Sử dụng unsubscribe để hủy listener
    //         };
    //     }
    // }, [userId])
    // Lắng nghe thay đổi hành vi của account
    useEffect(() => {
        if (userId) {
            const refBehavior = ref(database, `accounts/${userId}/behavior`)
            const unsubscribe = onValue(refBehavior, (snapshot) => {
                if (snapshot.exists()) {
                    const jsonBehavior = snapshot.val();
                    // Set behavior
                    setAccountBehavior(jsonBehavior) // homeprovider
                } else {
                    console.log("No data behavior");
                }
            }, (error) => {
                console.log("check 999:");
                console.error("Error fetching data behavior:", error);
            });

            return () => {
                unsubscribe(); // Sử dụng unsubscribe để hủy listener
            };
        }
    }, [userId])

    // Hàm lắng nghe thay khi có bài viết mới từ firebase để hiển thị button show list new post
    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refPosts = ref(database, 'posts/')
        const postsQuery = query(refPosts, orderByChild('status_id'), equalTo(1));
        const unsubscribe = onValue(postsQuery, (snapshot) => {
            if (snapshot.exists()) {
                const countNewPost = snapshot.size;
                const dataNewPostsJson = snapshot.val()
                setNewPostCount(countNewPost)
                // Lấy bài viết mới
                const dataNewPostsArray = Object.values(dataNewPostsJson)
                setDataNewPostList(dataNewPostsArray)
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

    // if (!userId || !accountBehavior || !dataCountries) {
    //     return <Text>Loading...</Text>
    // }
    return (
        <HomeContext.Provider
            value={{
                dataPosts, setDataPosts,
                dataTours,
                currentPostCount, setCurrentPostCount,
                allLocationIdFromPost, setAllLocationIdFromPost,
                newPostCount, setNewPostCount,
                accountBehavior, setAccountBehavior,
                loadedPosts, setLoadedPosts,
                loadedTours, setLoadedTours,
                dataModalSelected, setDataModalSelected,
                dataAllCities, setDataAllCities, // 3 lần
                dataAccount, setDataAccount,
                userId, setUserId,
                dataNewPostList, setDataNewPostList,
                dataToursSorted, setDataToursSorted,
                reload, setReload,
                search, setSearch,
                isLoading, setIsLoading,
                // ModalSearch
                modalSearchVisible, setModalSearchVisible,
                dataInput,
                dataCountries, setDataCountries,
                selectedCountry,
                dataCities, setDataCities,
                selectedCities, setSelectedCities,
                dataTypeSearch,
                selectedTypeSearch,
                // Modal new post
                modalNewPostVisible, setModalNewPostVisible,
            }}

        >
            {children}
        </HomeContext.Provider>
    )
}

export const useHomeProvider = () => useContext(HomeContext);

export default HomeProvider