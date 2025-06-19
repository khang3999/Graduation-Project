import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { database, get, onValue, ref, set, update } from '@/firebase/firebaseConfig';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { SelectList } from 'react-native-dropdown-select-list';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { iconColors } from '@/assets/colors';
import { formatDate, formatDate1 } from '@/utils/commons';
interface City {
    area_id: string;
    capital: boolean;
    defaultImages: string[];
    id_nuoc: string;
    information: string;
    latitude: number;
    longitude: number;
    name: string;
}
interface Point {
    [id: string]: {
        address: string;
        content: string;
        end: string;
        images: [string];
        latitude: number;
        longitude: number;
        start: string;
        title: string;
    };
}
interface Province {
    key: string;
    value: string;
    areaId: string;
    capital: boolean;
    defaultImages: string[];
    idCountry: string;
    information: string;
    latitude: number,
    longitude: number,
}
const areas = {
    "avietnam": {
        "bacTrungBo": [38, 40, 42, 44, 45, 46],
        "dongBacBo": [2, 4, 6, 8, 19, 20, 22, 24, 25],
        "dongBangSongCuuLong": [80, 82, 83, 84, 86, 87, 89, 91, 92, 93, 94, 95, 96],
        "dongBangSongHong": [1, 26, 27, 30, 31, 33, 34, 35, 36, 37],
        "dongNamBo": [70, 72, 74, 75, 77, 79],
        "duyenHaiNamTrungBo": [48, 49, 51, 52, 54, 56, 58, 60],
        "tayNguyen": [66, 67, 64, 62, 68],
        "tayBacBo": [10, 11, 12, 14, 15, 17]
    }
}
const areas456 = {
    "avietnam": {
        bacTrungBo: ["Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế"],
        dongBacBo: ["Hà Giang", "Cao Bằng", "Bắc Kạn", "Tuyên Quang",
            "Thái Nguyên", "Lạng Sơn", "Quảng Ninh", "Bắc Giang", "Phú Thọ"],
        dongBangSongCuuLong: [
            "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp", "An Giang", "Kiên Giang", "Thành phố Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Cà Mau"
        ],
        dongBangSongHong: [
            "Thành phố Hà Nội", "Vĩnh Phúc", "Bắc Ninh", "Hải Dương", "Thành phố Hải Phòng", "Hưng Yên", "Hà Nam", "Nam Định", "Thái Bình", "Ninh Bình"
        ],
        dongNamBo: [
            "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu", "Thành phố Hồ Chí Minh"
        ],
        duyenHaiNamTrungBo: [
            "Thành phố Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận"
        ],
        tayNguyen: [
            "Đắk Lắk", "Đắk Nông", "Gia Lai", "Kon Tum", "Lâm Đồng"
        ],
        tayBacBo: [
            "Lào Cai", "Điện Biên", "Lai Châu", "Sơn La", "Yên Bái", "Hòa Bình"
        ]
    }
};
// Luu firebase va fetch xuong voi bang modal
const areasByProvinceName = {
    "Thành phố Hà Nội": "dongBangSongHong",
    "Hà Giang": "dongBacBo",
    "Cao Bằng": "dongBacBo",
    "Bắc Kạn": "dongBacBo",
    "Tuyên Quang": "dongBacBo",
    "Lào Cai": "tayBacBo",
    "Điện Biên": "tayBacBo",
    "Lai Châu": "tayBacBo",
    "Sơn La": "tayBacBo",
    "Yên Bái": "tayBacBo",
    "Thái Nguyên": "dongBacBo",
    "Lạng Sơn": "dongBacBo",
    "Quảng Ninh": "dongBacBo",
    "Bắc Giang": "dongBacBo",
    "Phú Thọ": "dongBacBo",
    "Vĩnh Phúc": "dongBangSongHong",
    "Bắc Ninh": "dongBangSongHong",
    "Hải Dương": "dongBangSongHong",
    "Thành phố Hải Phòng": "dongBangSongHong",
    "Hưng Yên": "dongBangSongHong",
    "Thái Bình": "dongBangSongHong",
    "Hà Nam": "dongBangSongHong",
    "Nam Định": "dongBangSongHong",
    "Ninh Bình": "dongBangSongHong",
    "Thanh Hóa": "bacTrungBo",
    "Nghệ An": "bacTrungBo",
    "Hà Tĩnh": "bacTrungBo",
    "Quảng Bình": "bacTrungBo",
    "Quảng Trị": "bacTrungBo",
    "Thừa Thiên Huế": "bacTrungBo",
    "Thành phố Đà Nẵng": "duyenHaiNamTrungBo",
    "Quảng Nam": "duyenHaiNamTrungBo",
    "Quảng Ngãi": "duyenHaiNamTrungBo",
    "Bình Định": "duyenHaiNamTrungBo",
    "Phú Yên": "duyenHaiNamTrungBo",
    "Khánh Hòa": "duyenHaiNamTrungBo",
    "Ninh Thuận": "duyenHaiNamTrungBo",
    "Bình Thuận": "duyenHaiNamTrungBo",
    "Kon Tum": "tayNguyen",
    "Gia Lai": "tayNguyen",
    "Đắk Lắk": "tayNguyen",
    "Đắk Nông": "tayNguyen",
    "Lâm Đồng": "tayNguyen",
    "Bình Phước": "dongNamBo",
    "Tây Ninh": "dongNamBo",
    "Bình Dương": "dongNamBo",
    "Đồng Nai": "dongNamBo",
    "Bà Rịa - Vũng Tàu": "dongNamBo",
    "Thành phố Hồ Chí Minh": "dongNamBo",
    "Long An": "dongBangSongCuuLong",
    "Tiền Giang": "dongBangSongCuuLong",
    "Bến Tre": "dongBangSongCuuLong",
    "Trà Vinh": "dongBangSongCuuLong",
    "Vĩnh Long": "dongBangSongCuuLong",
    "Đồng Tháp": "dongBangSongCuuLong",
    "An Giang": "dongBangSongCuuLong",
    "Kiên Giang": "dongBangSongCuuLong",
    "Thành phố Cần Thơ": "dongBangSongCuuLong",
    "Hậu Giang": "dongBangSongCuuLong",
    "Sóc Trăng": "dongBangSongCuuLong",
    "Bạc Liêu": "dongBangSongCuuLong",
    "Cà Mau": "dongBangSongCuuLong"
};
const areas123 = {
    1: 'dongBangSongHong',
    2: 'dongBacBo',
    4: 'dongBacBo',
    6: 'dongBacBo',
    8: 'dongBacBo',
    10: 'tayBacBo',
    11: 'tayBacBo',
    12: 'tayBacBo',
    14: 'tayBacBo',
    15: 'tayBacBo',
    17: 'tayBacBo',
    19: 'dongBacBo',
    20: 'dongBacBo',
    22: 'dongBacBo',
    24: 'dongBacBo',
    25: 'dongBacBo',
    26: 'dongBangSongHong',
    27: 'dongBangSongHong',
    30: 'dongBangSongHong',
    31: 'dongBangSongHong',
    33: 'dongBangSongHong',
    34: 'dongBangSongHong',
    35: 'dongBangSongHong',
    36: 'dongBangSongHong',
    37: 'dongBangSongHong',
    38: 'bacTrungBo',
    40: 'bacTrungBo',
    42: 'bacTrungBo',
    44: 'bacTrungBo',
    45: 'bacTrungBo',
    46: 'bacTrungBo',
    48: 'duyenHaiNamTrungBo',
    49: 'duyenHaiNamTrungBo',
    51: 'duyenHaiNamTrungBo',
    52: 'duyenHaiNamTrungBo',
    54: 'duyenHaiNamTrungBo',
    56: 'duyenHaiNamTrungBo',
    58: 'duyenHaiNamTrungBo',
    60: 'duyenHaiNamTrungBo',
    62: 'tayNguyen',
    64: 'tayNguyen',
    66: 'tayNguyen',
    67: 'tayNguyen',
    68: 'tayNguyen',
    70: 'dongNamBo',
    72: 'dongNamBo',
    74: 'dongNamBo',
    75: 'dongNamBo',
    77: 'dongNamBo',
    79: 'dongNamBo',
    80: 'dongBangSongCuuLong',
    82: 'dongBangSongCuuLong',
    83: 'dongBangSongCuuLong',
    84: 'dongBangSongCuuLong',
    86: 'dongBangSongCuuLong',
    87: 'dongBangSongCuuLong',
    89: 'dongBangSongCuuLong',
    91: 'dongBangSongCuuLong',
    92: 'dongBangSongCuuLong',
    93: 'dongBangSongCuuLong',
    94: 'dongBangSongCuuLong',
    95: 'dongBangSongCuuLong',
    96: 'dongBangSongCuuLong'
}

// SCRIPT 
const scriptsToRun = [
    {
        name: 'getTotalPages',
        generate: () => `
                (function() {
                    const paginationUl = document.querySelector('ul.pagination');
                    let totalPages = 1;
                    if (paginationUl) {
                      const links = paginationUl.querySelectorAll('a');
                      const pageNumbers = Array.from(links)
                        .map(link => Number(link.textContent.trim()))
                        .filter(n => !isNaN(n));
                      totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
                    }

                    const webExtractedData = {
                        type: "totalPages",
                        data: totalPages
                    }

                    window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
                })();
                true;`
    },
    {
        name: 'getIdsFromPage',
        generate: () => `
            (function() {
                const ids = []; 
                const links = document.querySelectorAll('div.verticle-listing-caption > h4 > a');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    const match = href.match(/item=([0-9]+)/);
                    if (match && match[1]) ids.push(match[1]);
                });
                const webExtractedData = {
                    type: 'idsFromPage',
                    data: ids    
                }
                window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
            })();
            true;`
    }
]
const ScrapeInfomation = () => {
    const DOMAIN_CSDL = 'https://csdl.vietnamtourism.gov.vn'
    const DOMAIN_OSM = 'https://nominatim.openstreetmap.org';
    const webviewRef = useRef<WebView>(null);
    const [stringURI, setStringURI] = useState(`${DOMAIN_CSDL}/dest`); // URI của webview, mặc định là trang tổng quan
    // Dữ liệu hoàn chỉnh để up lên firebase
    const [handleMessage, setHandleMessage] = useState<(event: WebViewMessageEvent) => void>(() => () => { });
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [selectedCity, setSelectedCity] = useState<Province | null>(null)
    const [dataCities, setDataCities] = useState<Province[]>([])
    const [ids, setIds] = useState<string[]>([]);
    const [currentIdIndex, setCurrentIdIndex] = useState(0);
    const [tempData, setTempData] = useState(0);
    const [dataProvincesCrawled, setDataProvincesCrawled] = useState<any[]>([])
    const [paginationWebview, setPaginationWebview] = useState(1)
    const [provinceUpdatedAt, setProvinceUpdatedAt] = useState(0);
    const [stringScript, setStringScript] = useState('');
    const { dataCountries }: any = useHomeProvider()

    // Lấy các quốc gia - XONG
    const fetchCityByCountry = useCallback(async (countryId: any) => {
        try {
            const refProvinces = ref(database, `provinces/${countryId}`)
            const snapshot = await get(refProvinces);
            if (snapshot.exists()) {
                const dataProvinces = snapshot.val();
                const dataProvincesArray: Province[] = (Object.values(dataProvinces.data) as Province[]).sort((a: Province, b: Province) => a.value.localeCompare(b.value));
                setProvinceUpdatedAt(dataProvinces.updatedAt || 0);
                setDataCities(dataProvincesArray);
            } else {
                console.log("FetchCityByCountry: No data available1");
            }
        } catch (error) {
            console.error("FetchCityByCountry: Error fetching data: ", error);
        }
    }, [])

    // Lấy kinh độ và vĩ độ của tỉnh/thành phố
    const fetchLatLong = useCallback(async (stringQuery: string) => {
        try {
            const response = await fetch(`${DOMAIN_OSM}/search?q=${encodeURIComponent(stringQuery)}&format=json`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Travelogue' // bắt buộc theo chính sách Nominatim
                }
            });
            if (!response.ok) throw new Error('Failed to fetch location data');
            const data = await response.json();
            return data;

        } catch (error) {
            console.error("Error fetching city data (Nominatim error): ", error);
            return { latitude: 0, longitude: 0 };
        }
    }, [])
    // Lấy tuần tự kinh độ và vĩ độ các tỉnh
    const fetchProvincesLatLongSequentially = async (provinces: any[]) => {
        const updated: Record<string, Province> = {};
        for (const provinceObj of provinces) {
            // Đưa Object thành mảng ["01":{area_id:"aa",...}]
            const [idCountry, rawData] = Object.entries(provinceObj)[0];
            //Ép kiểu
            const valueData = rawData as Province
            try {
                // Chờ xong trước khi tiếp, location là object chứa key và value, 
                const stringQuery = valueData.value + (selectedCountry === 'avietnam' ? ' Việt Nam' : '');
                const result = await fetchLatLong(stringQuery);
                const first = result[0];
                if (first) {
                    updated[idCountry] = {
                        ...valueData,
                        latitude: parseFloat(first.lat),
                        longitude: parseFloat(first.lon)
                    };
                    // console.log(`${valueData.value}: lat=${first.lat}, lon=${first.lon}`);
                } else {
                    console.log(`Không tìm thấy kết quả cho ${valueData.value}`);
                }

                // 💤 Delay 500ms để tránh spam API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
                console.error(`Lỗi với ${location}:`, error.message);
            }
        }

        return updated
    }

    // UPDATE provinces : Ghi lên firebase
    // Data có dạng {'avietnam':[{'key':01, value:'TP Hà Nội'}, ...]}
    const updateProvinces = useCallback(async (data: any, selectedCountry: string) => {
        try {
            const refProvinces = ref(database, `provinces/${selectedCountry}/`)
            // console.log(JSON.stringify(data, null, 2), 'pipip');

            await update(refProvinces, data)
        } catch (error) {
            console.error("Update data provinces: ", error);
        }
    }, [])

    // Xử lý sự kiện khi chọn quốc gia
    const handleSelectedCountry = (val: any) => {
        if (val == 'avietnam') {
            setStringURI(`${DOMAIN_CSDL}/dest`);
            setSelectedCountry(val)
            fetchCityByCountry(val)
        } else {
            Alert.alert('Chưa hỗ trợ quốc gia này');
            setSelectedCountry(val)
            setDataCities([])
        }
        // Reset when changing country
        setSelectedCity(null);
        setIds([])
    }

    // Xử lý sự kiện khi chọn tỉnh/thành phố, chạy script khi webview load xong
    const handleSelectedCity = (val: any) => {
        if (selectedCountry === 'avietnam') {
            const selectedProvince = dataCities.find((item: Province) => item.key === val);
            setSelectedCity(selectedProvince ? selectedProvince : null); // Khi không tìm thấy trả về undefine cần chuyển về null

            // Gán lại callback inject JS
            setStringScript(scriptsToRun[0].generate());

            // Gán lại callback nhận message
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                console.log('totalPages từ WebView:', message.data);
                setPaginationWebview(message.data);
            });

            // Cuối cùng đổi URI => trigger render WebView mới
            setStringURI(`${DOMAIN_CSDL}/dest/?province=${val}`);
            setCurrentIdIndex(0);
            setTempData(0);
            setIds([]); // Reset ids

        }
    };

    // Kiểm tra số trang
    useEffect(() => {
        console.log('check run: called', paginationWebview);
    }, [paginationWebview, selectedCity]);

    // Xử lý khi bấm vào button cập nhật provinces
    const handleTapOnUpdateProvincesButton = useCallback(() => {
        if (!selectedCountry) {
            Alert.alert('Chưa chọn quốc gia');
            return;
        }
        if (selectedCountry !== 'avietnam') {
            Alert.alert('Chưa hỗ trợ quốc gia này');
            return;
        }

        // {'avietnam':[{key:'01',value:'Thành phố Hà Nội'},...]}
        // XONG
        const crawlScriptProvinces = `
        (function() {
            const areasByProvinceName = ${JSON.stringify(areasByProvinceName)};
            const provinceSelect = document.getElementById("province");
            const options = provinceSelect ? provinceSelect.querySelectorAll("option") : [];
            const provinces = {};

            options.forEach((option) => {
                const key = option.value.trim();
                const value = option.textContent.trim();
                // Bỏ qua nếu key rỗng hoặc chứa ký tự không hợp lệ
                if (!key || /[.#$/[\]]/.test(key)) return;
                const matchedArea = Object.entries(areasByProvinceName).find(([provinceName]) =>
                    provinceName.includes(value)
                );
             
                provinces[key] = {
                    areaId: matchedArea ? matchedArea[1] : 'unknown',
                    capital: value.includes('Hà Nội'),
                    key: key,
                    defaultImages: [],
                    idCountry: "${selectedCountry}",
                    information: 'Chưa có thông tin',
                    latitude: 0,
                    longitude: 0,
                    value: value,
                };
            });
            const webExtractedData = {
                type: 'dataProvinces',
                data:  provinces
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
            })();
            true;
`;

        webviewRef.current?.injectJavaScript(crawlScriptProvinces);
        setHandleMessage(() => (event: WebViewMessageEvent) => {
            const message = JSON.parse(event.nativeEvent.data);
            // console.log(message.data, 'provinces');
            // Khác con trỏ dù data giống nhau
            const arrayFormat = Object.entries(message.data).map(([key, value]) => ({
                [key]: value
            }));
            setDataProvincesCrawled(arrayFormat || []);
        });
    }, [selectedCountry,])

    // Xử lý crawl kinh độ và vĩ độ sau khi crawl tất cả tỉnh
    useEffect(() => {
        // Không làm gì nếu không có dữ liệu provinces
        if (dataProvincesCrawled.length === 0) return;

        // Thực hiện crawl longitude và latitude cho từng tỉnh
        const updateToFirebase = async () => {
            // Chỉ lấy 3 tỉnh đầu tiên để tránh quá tải
            const updated = await fetchProvincesLatLongSequentially(dataProvincesCrawled.slice(0, 3))
            const dataUpdate = { data: updated, updatedAt: Date.now() }
            await updateProvinces(dataUpdate, selectedCountry ? selectedCountry : 'unknown');
            // Lấy lại thời gian cập nhật
            fetchCityByCountry(selectedCountry)
        }
        updateToFirebase();
    }, [dataProvincesCrawled]);

    // Chạy script trực tiếp trên Webview đã có sẵn
    const handleTapOnUpdateOneCityButton = useCallback(() => {
        if (!selectedCity) {
            Alert.alert('Chưa chọn tỉnh/thành phố');
            return;
        }
        // console.log(paginationWebview);

        if (paginationWebview == 1) {
            const script = scriptsToRun[1].generate();
            webviewRef.current?.injectJavaScript(script);
            // const crawlScriptPagination = ``;
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const ids = message.data;
                setIds(ids ? ids : []);
                setCurrentIdIndex(0)// khởi chạy từ index đầu tiên
                console.log(message.type, 'dataaa');
            });
        }
    }, [ids, selectedCity])

    // Update lên firebase từng địa điểm theo từng lần crawl data của địa điểm đó
    const updatePointData = useCallback(async (data: any) => {
        if (!selectedCity) return;
        try {
            const refPointsNew = ref(database, `pointsNew/${selectedCountry}/${selectedCity?.key}`);
            await update(refPointsNew, data);
        } catch (error) {
            console.error("Update data pointsNew: ", error);
        }
    }, [selectedCountry, selectedCity])

    // Hàm chạy script theo index và update dữ liệu crawl về lên firebase
    const autoRunScriptCrawlPointData = useCallback((pointId: string) => {
        setHandleMessage(() => async (event: WebViewMessageEvent) => {
            const message = JSON.parse(event.nativeEvent.data);

            console.log(message.type, 'message.data');
            if (message.type !== 'dataPoint') return;

            const point: Point = {
                [pointId]: {
                    address: message.data.address || 'Chưa có địa chỉ',
                    content: message.data.content || 'Chưa có nội dung',
                    end: formatDate(message.data.end) || 'Chưa có thời gian kết thúc',
                    images: message.data.images || [],
                    latitude: message.data.latitude || 0,
                    longitude: message.data.longitude || 0,
                    start: formatDate(message.data.start) || 'Chưa có thời gian bắt đầu',
                    title: message.data.title || 'Chưa có tiêu đề',
                }
            }
            // Xu li
            if (message.type === 'dataPoint') {
                console.log('Crawl data thành công cho id:', pointId);

                await updatePointData(point)
                setCurrentIdIndex(prev => prev + 1); // sang item tiếp theo
            }
        });
        // Gán lại callback inject JS
        setStringScript(`(function() {
            const addressElements = document.querySelectorAll('span.d-block');
            const titleElements = document.querySelectorAll('div.header a');
            const contentElements = document.querySelectorAll("div.content-detail");
            const geoPositionElements = document.querySelector('meta[name="geo.position"]');
            const imagesElements = document.querySelectorAll('a.card');

            let title = '';
            if (titleElements.length > 0) {
                for (let a of titleElements) {
                    if (!a.hasAttribute('href')) {
                        title = a.textContent.trim();
                        break; // dừng sau khi tìm được thẻ a không có href
                    }
                }
            }

            let address = 'Chưa có địa chỉ';
            if (addressElements.length > 0) {
                const rawText = addressElements[0].textContent || '';
                // Xóa chuỗi 'Địa chỉ:' nếu có 
                const cleaned = rawText.replace('Địa chỉ:', '').trim();
                // trim dấu ',' nếu có
                address = cleaned.startsWith(',') ? cleaned.slice(1).trim() : cleaned;
            }

            let contentHTMLToMarkdown = 'Chưa có nội dung';
            if (contentElements.length > 0) {
                contentHTMLToMarkdown = '';
                for (let i = 1; i < addressElements.length; i++) {
                    contentHTMLToMarkdown += addressElements[i].outerHTML;
                }
                contentElements.forEach((element) => {
                    contentHTMLToMarkdown += element.outerHTML;
                });
            }

            let longitude = 0;
            let latitude = 0;
            if (geoPositionElements) {
                const content = geoPositionElements.getAttribute('content'); // "21.023897;105.844719"
                [latitude, longitude] = content.split(';').map(Number);
            }

            let images = [];
            if (imagesElements.length > 0) {
                imagesElements.forEach((a) => {
                    const imageURL = a.getAttribute('href');
                    if (imageURL) {
                        images.push(imageURL);
                    }
                });
            }

            const webExtractedData  = {
                type: 'dataPoint',
                data:{
                    address: address,
                    content: contentHTMLToMarkdown,
                    longitude: longitude,
                    latitude: latitude,
                    title: title,
                    images: images,
                    start: '',
                    end: '',
                }
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
        })(); true;`);

        // Gán lại callback nhận message

        setStringURI(`${DOMAIN_CSDL}/?item=${pointId}`);
    },[])

    // Chạy script tự động để Crawl point data
    // Chỉ chạy khi currentIdIndex thay đổi để lặp qua các ids của tỉnh
    useEffect(() => {
        if (currentIdIndex === -1) return; // Không làm gì nếu currentIdIndex là -1

        if (currentIdIndex < ids.length) {
            autoRunScriptCrawlPointData(ids[currentIdIndex]);
            console.log(tempData, 'temp - ', currentIdIndex, 'currentIdIndex');
        } else {
            console.log('Hoàn tất crawl toàn bộ ids!', currentIdIndex);

            // Reset các biến về default
            setStringURI(selectedCity ? `${DOMAIN_CSDL}/dest/?province=${selectedCity?.key}` : `${DOMAIN_CSDL}/dest`);
            setStringScript('');
            setHandleMessage(() => () => { });
            setCurrentIdIndex(-1);
        }
    }, [currentIdIndex]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.row, { justifyContent: 'space-between', margin: 10 }]}>
                <View>
                    <View style={styles.wrapLabelModalFilter}>
                        <Text style={styles.textLabelModalFilter}>Quốc gia</Text>
                        <FontAwesome name="globe" size={20} color={iconColors.green1} />
                    </View>
                    <SelectList
                        dropdownStyles={{
                            zIndex: 10,
                            position: "absolute",
                            width: 170,
                            backgroundColor: "white",
                            top: 40,
                        }}
                        boxStyles={{ width: 170 }}
                        setSelected={(val: any) => handleSelectedCountry(val)}
                        data={dataCountries}
                        save="key"
                        placeholder='Chưa chọn'
                        searchPlaceholder='Nhập tìm'
                        notFoundText='Không tìm thấy quốc gia'
                    />
                </View>
                <View>
                    <View style={styles.wrapLabelModalFilter}>
                        <Text style={styles.textLabelModalFilter}>Tỉnh/Thành phố</Text>
                        <FontAwesome6 name="tree-city" size={18} color={iconColors.green1} />
                    </View>
                    <SelectList
                        dropdownStyles={{
                            zIndex: 10,
                            position: "absolute",
                            width: 170,
                            backgroundColor: "white",
                            top: 40,
                        }}
                        boxStyles={{ width: 200 }}
                        setSelected={(val: any) => handleSelectedCity(val)}
                        data={dataCities}
                        defaultOption={{ key: '', value: 'Chưa chọn' }}
                        save="key"
                        placeholder='Chưa chọn'
                        searchPlaceholder='Nhập tìm'
                        notFoundText='Không tìm thấy tỉnh/thành phố'
                    />
                </View>
            </View>
            <View style={styles.row}>
                <TouchableOpacity
                    disabled={selectedCountry == 'avietnam' ? false : true}
                    style={[styles.btn, selectedCountry == 'avietnam' ? {} : { backgroundColor: 'gray' }]}
                    onPress={handleTapOnUpdateProvincesButton}>
                    <Text>Cập nhập tỉnh/ thành phố</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={handleTapOnUpdateOneCityButton} >
                    <Text>Cập nhập địa điểm theo tỉnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={selectedCountry == 'avietnam' ? false : true}
                    style={styles.btn}
                    onPress={() => console.log('Cập nhật tất cả')}>
                    <Text>Cập nhập tất cả</Text>
                </TouchableOpacity>
            </View >
            <View style={{}}>
                <Text>Dữ liệu các tỉnh/ thành phố cập nhật lúc: {provinceUpdatedAt != 0 ? (formatDate1(provinceUpdatedAt)) : 'unknown'} </Text>
                <Text>Dữ liệu tất cả địa điểm cập nhật lúc: </Text>
                {/* {selectedCity && } */}
                <Text>Dữ liệu các địa điểm tại Hà nội cập nhật lúc: </Text>
            </View>

            <View style={{ flex: 1 }}>
                {selectedCountry == 'avietnam' ? (
                    <WebView
                        key={stringURI}
                        ref={webviewRef}
                        source={{ uri: stringURI }}
                        onLoadEnd={() => {
                            if (stringScript && webviewRef.current?.injectJavaScript) {
                                webviewRef.current.injectJavaScript(stringScript);
                            }
                        }}
                        onMessage={handleMessage}
                    />) : (
                    <Text>Chưa hỗ trợ quốc gia này</Text>
                )}
            </View>

        </SafeAreaView>
    )
}

export default ScrapeInfomation

const styles = StyleSheet.create({
    // Modal filter
    wrapLabelModalFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 6
    },
    textLabelModalFilter: {
        fontWeight: '500',
        marginVertical: 8,
        marginRight: 4,
        // backgroundColor:'green'
    },
    btn: {
        flexDirection: 'row',
        width: 120,
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        margin: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})