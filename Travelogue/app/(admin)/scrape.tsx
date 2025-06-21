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
// interface Province {
//     key: string;
//     value: string;
//     areaId: string;
//     capital: boolean;
//     defaultImages: string[];
//     idCountry: string;
//     information: string;
//     latitude: number,
//     longitude: number,
// }
class Province {
    key: string = '';
    value: string = '';
    areaId: string = '';
    capital: boolean = false;
    defaultImages: string[] = [];
    idCountry: string = '';
    information: string = '';
    latitude: number = 0;
    longitude: number = 0;
    constructor();
    constructor(
        key: string,
        value: string,
        areaId: string,
        capital: boolean,
        defaultImages: string[],
        idCountry: string,
        information: string,
        latitude: number,
        longitude: number,
    )
    constructor(
        key?: string,
        value?: string,
        areaId?: string,
        capital?: boolean,
        defaultImages?: string[],
        idCountry?: string,
        information?: string,
        latitude?: number,
        longitude?: number,
    ) {
        this.key = key ?? '-1';
        this.value = value ?? 'Chọn tỉnh/thành phố';
        this.areaId = areaId ?? '';
        this.capital = capital ?? false;
        this.defaultImages = defaultImages ?? [];
        this.idCountry = idCountry ?? '';
        this.information = information ?? '';
        this.latitude = latitude ?? 0;
        this.longitude = longitude ?? 0;
    }

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
const scriptsToRun = {
    getTotalPages: {
        // name: 'getTotalPages',
        generate: () => `
                (function() {
                    const paginationUl = document.querySelector('ul.pagination');
                    let totalPages = 1;
                    if (paginationUl) {
                        const links = paginationUl.querySelectorAll('a[data-ci-pagination-page]');
                        const pageNumbers = Array.from(links)
                        .map(link => Number(link.getAttribute('data-ci-pagination-page')))
                        .filter(n => !isNaN(n)); // chỉ giữ số hợp lệ

                        totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
                    }

                    const webExtractedData = {
                        type: "totalPages",
                        data: totalPages
                    }

                    window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
                })();
                true;`
    }
    ,
    getIdsFromPage:
    {
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
}
const ScrapeInfomation = () => {
    const DOMAIN_CSDL = 'https://csdl.vietnamtourism.gov.vn'
    const DOMAIN_OSM = 'https://nominatim.openstreetmap.org';
    const webviewRef = useRef<WebView>(null);
    // URI của webview, mặc định là trang tổng quan
    const [stringURI, setStringURI] = useState(`${DOMAIN_CSDL}/dest`);
    const [stringScript, setStringScript] = useState('');
    const [handleMessage, setHandleMessage] = useState<(event: WebViewMessageEvent) => void>(() => () => { })

    const [selectedCountry, setSelectedCountry] = useState(null)
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
    const [dataProvinces, setDataProvinces] = useState<Province[]>([])
    const [pointIds, setPointIds] = useState<string[]>([]);
    const [currentIndexPointIds, setCurrentIndexPointIds] = useState(-1);
    const [currentIndexPage, setCurrentIndexPage] = useState(-1);
    const [currentIndexProvince, setCurrentIndexProvince] = useState(-1);
    const [dataProvincesCrawled, setDataProvincesCrawled] = useState<any[]>([])
    const [totalPage, setTotalPages] = useState(1)
    const [provinceUpdatedAt, setProvinceUpdatedAt] = useState(0);
    const { dataCountries }: any = useHomeProvider()
    // const [dataCountriesSelectList, setDataCountriesSelectList] = useState([{ "key": "default", "value": "Chưa chọn" }, ...dataCountries])
    // useEffect(() => {
    //     setDataCountriesSelectList([{ key: "default", value: "Chưa chọn" }, ...dataCountries]);
    // }, [dataCountries]);
    // Lấy các quốc gia - XONG
    const fetchCityByCountry = useCallback(async (countryId: any) => {
        try {
            const refProvinces = ref(database, `provinces/${countryId}`)
            const snapshot = await get(refProvinces);
            if (snapshot.exists()) {
                const dataProvinces = snapshot.val();
                const dataProvincesArray: Province[] = (Object.values(dataProvinces.data) as Province[]).sort((a: Province, b: Province) => a.value.localeCompare(b.value));
                dataProvincesArray.unshift(new Province());
                setDataProvinces(dataProvincesArray);
                setProvinceUpdatedAt(dataProvinces.updatedAt || 0);
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
    const fetchProvincesLatLongSequentially = useCallback(async (provinces: any[]) => {
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
    }, [selectedCountry])

    // UPDATE provinces : Ghi lên firebase --- XONG
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

    // Xử lý sự kiện khi chọn quốc gia --- XONG
    const handleSelectedCountry = useCallback((val: any) => {
        if (!val) return // Dùng khi có default 

        if (val == 'avietnam') {
            fetchCityByCountry(val)
        }
        else {
            Alert.alert('Chưa hỗ trợ quốc gia này');
            setDataProvinces([])
        }
        // Vẫn luôn set selected == val
        setSelectedCountry(val)
        // Reset when changing country
        setCurrentIndexPage(-1)
        setCurrentIndexPointIds(-1)
        setSelectedProvince(new Province());
        setPointIds([])

    }, [fetchCityByCountry])


    // Xử lý sự kiện khi chọn tỉnh/thành phố, chạy script khi webview load xong --- XONG --- ĐƯA XỬ LÝ CHỌN TỈNH RA RIÊNG ĐỂ KHI CHẠY TỰ ĐỘNG CHỈ CẦN GỌI LẠI
    const handleSelectedProvince = useCallback((val: any) => {
        if (!val) return
        if (selectedCountry === 'avietnam' && val != '-1') {
            console.log("chon dung");

            const selectedProvinceTemp = dataProvinces.find((item: Province) => item.key === val);
            console.log("chon dung", selectedProvinceTemp);

            setSelectedProvince(selectedProvinceTemp ? selectedProvinceTemp : dataProvinces[0]); // Khi không tìm thấy selectedProvinceTemp là  undefine cần chuyển về phần tử đầu của danh sách là mặc định

            // Gán lại callback inject JS
            setStringScript(scriptsToRun.getTotalPages.generate());

            // Gán lại callback nhận message
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                console.log('totalPages từ WebView:', message.data);
                setTotalPages(message.data);
            });

            // Cuối cùng đổi URI => trigger render WebView mới
            setStringURI(`${DOMAIN_CSDL}/dest/?province=${val}`);
        } else {
            console.log("day la khong xac dinh");

            setSelectedProvince(new Province());
            // Gán lại callback inject JS
            setStringScript('');
            setHandleMessage(() => () => { });
            setStringURI(``);
        }
        console.log(val, 'sel');
        setPointIds([]); // Reset ids
        setCurrentIndexPage(-1)
        setCurrentIndexPointIds(-1); // Reset to -1
    }, [dataProvinces, selectedCountry]);

    // Xử lý khi bấm vào button cập nhật provinces của country --- XONG
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
    }, [selectedCountry])

    // Hàm chọn 1 tỉnh và cập nhật
    const handleTapOnUpdateOneCityButton = useCallback(() => {
        console.log("check selected ", selectedProvince);

        if (!selectedProvince || selectedProvince.key == '-1') {
            Alert.alert('Chưa chọn tỉnh/thành phố');
            return;
        }
        // console.log(totalPage);

        if (totalPage === 1) {
            // Inject script trực tiếp tại page này vì chỉ có 1 page
            const script = scriptsToRun.getIdsFromPage.generate();
            webviewRef.current?.injectJavaScript(script);
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIds = message.data;
                setPointIds(pointIds ? pointIds : []);
                // Set để ghi dữ liệu lên firebase luôn 
                console.log(currentIndexPointIds);

                setCurrentIndexPointIds(0)// khởi chạy từ index đầu tiên
                console.log(message.type, 'dataaa');
            });
        }
        else {
            // Chỉ Set currentIndexPage(0)  để trigger chạy crawl tất cả pointIds vào mảng từ trang đầu tiên
            console.log('here');
            setCurrentIndexPage(0)
        }
        // }, [pointIds, selectedProvince, totalPage])
    }, [totalPage, selectedProvince])

    // Hàm tự động cập nhật tất cả ------TOI DAY ROI
    const handleAutoUpdateAllButton = useCallback(() => {
        // Set index để start chạy là phần tử thứ 2 của dataProvinces
        setCurrentIndexProvince(0)
    }, [])

    const autoOpenWebviewForProvince = useCallback((countryId: string, provinceId: string) => {
        if (countryId === 'avietnam') {
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                
            })

            // Gán lại callback inject JS
            setStringScript(scriptsToRun.getTotalPages.generate());

            setStringURI(`${DOMAIN_CSDL}/dest/?province=${provinceId}`)

        } else {
            setStringURI('')
        }
    }, [])

    useEffect(() => {
        if (!selectedCountry || selectedCountry !== 'avietnam' || currentIndexProvince === -1) return


    }, [currentIndexProvince])

    // Update lên firebase từng địa điểm theo từng lần crawl data của địa điểm đó
    const updatePointData = useCallback(async (data: any, selectedCountry: string, selectedProvinceId: string) => {
        try {
            const refPointsNew = ref(database, `pointsNew/${selectedCountry}/${selectedProvinceId}`);

            await update(refPointsNew, data);
            console.log("call up to fb");
        } catch (error) {
            console.error("Update data pointsNew: ", error);
        }
    }, [])

    // Hàm chạy script theo index và update dữ liệu crawl về lên firebase
    const autoRunScriptCrawlPointData = useCallback((pointId: string, selectedCountry: string, selectedProvinceId: string) => {
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

                await updatePointData(point, selectedCountry, selectedProvinceId)
            }
            setCurrentIndexPointIds(prev => prev + 1); // sang item tiếp theo
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
        setStringURI(`${DOMAIN_CSDL}/dest/?item=${pointId}`);
    }, [updatePointData])

    // Hàm script theo currentPageIndex để lấy tất cả pointId
    const autoRunScriptCrawlPointIdsAllPage = useCallback((currentIndexPage: number) => {
        console.log("runnn");
        const script = scriptsToRun.getIdsFromPage.generate();
        if (currentIndexPage == 0) {
            console.log("runnn page 1");

            // Script lấy tất cả id
            webviewRef.current?.injectJavaScript(script);
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIds = message.data;
                // Lấy tất cả pointId của trang đầu tiên bỏ vào mảng
                console.log(message.type, 'type');
                console.log(pointIds, 'id data');

                setPointIds(pointIds ? pointIds : []);
                // Set qua trang tiep theo
                setCurrentIndexPage(currentIndexPage + 1)
            });
        } else {
            console.log("runnn page next");
            console.log(pointIds, 'id data 1');

            setHandleMessage(() => async (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIdsTemp = message.data; // luôn là mảng vì webview trả về mảng rỗng
                // Gộp tất cả các id lại và lọc ra phần tử trùng nhau
                // if (pointIdsTemp.length > 0) {
                console.log(pointIds, 'id data 2 ');

                setPointIds(prev => Array.from(new Set([...prev, ...pointIdsTemp])));
                setCurrentIndexPage(currentIndexPage + 1)
            });
            // Không cần set lại script vì vẫn còn script cũ
            setStringScript(script)
            setStringURI(`${DOMAIN_CSDL}/dest/?province=${selectedProvince?.key}&page=${currentIndexPage + 1}`)
        }
    }, [selectedProvince])

    // Kiểm tra số trang
    useEffect(() => {
        console.log('check run: called', totalPage);
        console.log('selectedProvince', selectedProvince);

    }, [totalPage, selectedProvince]);


    // Dùng để trigger load webview
    useEffect(() => {
        if (!selectedCountry) return
        if (selectedCountry === 'avietnam') {
            setStringURI(`${DOMAIN_CSDL}/dest`);
        } else {
            setStringURI('')
        }
    }, [selectedCountry, provinceUpdatedAt])

    // Province: Xử lý crawl kinh độ và vĩ độ sau khi crawl tất cả tỉnh
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

    // Script này để lấy tất cả pointId qua từng trang
    useEffect(() => {
        console.log('cur-total', currentIndexPage, totalPage);

        if (currentIndexPage === -1 || selectedProvince?.key == '-1' || selectedCountry !== 'avietnam') return;

        // console.log('id-ttpageaa', currentIndexPage, totalPage);

        const currentPage = currentIndexPage + 1 // Lưu tạm để log
        if (currentIndexPage < totalPage) {
            // Gọi hàm autoRuScriptCrawlPointIdsAllPage lấy tất cả pointId qua từng trang
            autoRunScriptCrawlPointIdsAllPage(currentIndexPage)
            console.log('Crawl data at page: ', currentPage);
        } else {
            console.log('Completed auto crawl pointId in all page, last page is: ', currentPage);
            console.log(pointIds, 'ids');

            // Thực hiện trigger cho hàm autoRunScriptCrawlPointData chạy bằng cách setCurrentIndexPointIds(0)
            setCurrentIndexPointIds(0)
            setCurrentIndexPage(-1)
        }
        // console.log('id-ttpageaacom', currentIndexPage, totalPage);

    }, [currentIndexPage, autoRunScriptCrawlPointIdsAllPage])

    // Point: Chạy script tự động để Crawl point data
    // Chỉ chạy khi currentIndexPointIds thay đổi để lặp qua các pointIds của tỉnh
    useEffect(() => {
        if (currentIndexPointIds === -1 || selectedProvince?.key == '-1' || selectedCountry !== 'avietnam') return; // Không làm gì nếu currentIndexPointIds là -1

        if (currentIndexPointIds < pointIds.length) {
            autoRunScriptCrawlPointData(pointIds[currentIndexPointIds], selectedCountry ?? 'unknown', selectedProvince?.key || 'unknown');
            // console.log(currentIndexPointIds, 'currentIndexPointIds');
        } else {
            console.log('Hoàn tất crawl toàn bộ ids!', currentIndexPointIds);

            // Reset các biến về default
            setStringURI(selectedProvince ? `${DOMAIN_CSDL}/dest/?province=${selectedProvince?.key}` : `${DOMAIN_CSDL}/dest`);
            setStringScript('');
            setHandleMessage(() => () => { });
            setCurrentIndexPointIds(-1);
        }
    }, [currentIndexPointIds, autoRunScriptCrawlPointData]);

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
                        key={selectedCountry}
                        dropdownStyles={{
                            zIndex: 10,
                            position: "absolute",
                            width: 170,
                            backgroundColor: "white",
                            top: 40,
                        }}
                        boxStyles={{ width: 200 }}
                        setSelected={(val: any) => handleSelectedProvince(val)}
                        data={dataProvinces}
                        defaultOption={new Province()}
                        save="key"
                        placeholder='Chọn tỉnh/thành phố'
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
                {/* {selectedProvince && } */}
                <Text>Dữ liệu các địa điểm tại Hà nội cập nhật lúc: </Text>
            </View>

            <View style={{ flex: 1 }}>
                {selectedCountry == 'avietnam' ? (
                    <WebView
                        key={stringURI}
                        ref={webviewRef}
                        source={{ uri: stringURI }}
                        onLoadEnd={() => {
                            // console.log('🔍 stringScript:', stringURI);
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