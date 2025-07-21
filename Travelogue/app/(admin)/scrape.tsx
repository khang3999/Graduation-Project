import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { database, get, onValue, ref, set, update } from '@/firebase/firebaseConfig';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { SelectList } from 'react-native-dropdown-select-list';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { iconColors } from '@/assets/colors';
import { formatDate, formatDate1 } from '@/utils/commons';
import { Geocode, Point } from '@/model/PointModal';
import { Province } from '@/model/ProvinceModal';
import { extractFullLocationSlug, formatKeySearch } from '@/utils';
import { useAdminProvider } from '@/contexts/AdminProvider';
import { limitToFirst, query } from 'firebase/database';

// // Luu firebase va fetch xuong voi bang modal
// const areasByProvinceName = {
//     "Thành phố Hà Nội": "dongBangSongHong",
//     "Hà Giang": "dongBacBo",
//     "Cao Bằng": "dongBacBo",
//     "Bắc Kạn": "dongBacBo",
//     "Tuyên Quang": "dongBacBo",
//     "Lào Cai": "tayBacBo",
//     "Điện Biên": "tayBacBo",
//     "Lai Châu": "tayBacBo",
//     "Sơn La": "tayBacBo",
//     "Yên Bái": "tayBacBo",
//     "Thái Nguyên": "dongBacBo",
//     "Lạng Sơn": "dongBacBo",
//     "Quảng Ninh": "dongBacBo",
//     "Bắc Giang": "dongBacBo",
//     "Phú Thọ": "dongBacBo",
//     "Vĩnh Phúc": "dongBangSongHong",
//     "Bắc Ninh": "dongBangSongHong",
//     "Hải Dương": "dongBangSongHong",
//     "Thành phố Hải Phòng": "dongBangSongHong",
//     "Hưng Yên": "dongBangSongHong",
//     "Thái Bình": "dongBangSongHong",
//     "Hà Nam": "dongBangSongHong",
//     "Nam Định": "dongBangSongHong",
//     "Ninh Bình": "dongBangSongHong",
//     "Thanh Hóa": "bacTrungBo",
//     "Nghệ An": "bacTrungBo",
//     "Hà Tĩnh": "bacTrungBo",
//     "Quảng Bình": "bacTrungBo",
//     "Quảng Trị": "bacTrungBo",
//     "Thừa Thiên Huế": "bacTrungBo",
//     "Thành phố Đà Nẵng": "duyenHaiNamTrungBo",
//     "Quảng Nam": "duyenHaiNamTrungBo",
//     "Quảng Ngãi": "duyenHaiNamTrungBo",
//     "Bình Định": "duyenHaiNamTrungBo",
//     "Phú Yên": "duyenHaiNamTrungBo",
//     "Khánh Hòa": "duyenHaiNamTrungBo",
//     "Ninh Thuận": "duyenHaiNamTrungBo",
//     "Bình Thuận": "duyenHaiNamTrungBo",
//     "Kon Tum": "tayNguyen",
//     "Gia Lai": "tayNguyen",
//     "Đắk Lắk": "tayNguyen",
//     "Đắk Nông": "tayNguyen",
//     "Lâm Đồng": "tayNguyen",
//     "Bình Phước": "dongNamBo",
//     "Tây Ninh": "dongNamBo",
//     "Bình Dương": "dongNamBo",
//     "Đồng Nai": "dongNamBo",
//     "Bà Rịa - Vũng Tàu": "dongNamBo",
//     "Thành phố Hồ Chí Minh": "dongNamBo",
//     "Long An": "dongBangSongCuuLong",
//     "Tiền Giang": "dongBangSongCuuLong",
//     "Bến Tre": "dongBangSongCuuLong",
//     "Trà Vinh": "dongBangSongCuuLong",
//     "Vĩnh Long": "dongBangSongCuuLong",
//     "Đồng Tháp": "dongBangSongCuuLong",
//     "An Giang": "dongBangSongCuuLong",
//     "Kiên Giang": "dongBangSongCuuLong",
//     "Thành phố Cần Thơ": "dongBangSongCuuLong",
//     "Hậu Giang": "dongBangSongCuuLong",
//     "Sóc Trăng": "dongBangSongCuuLong",
//     "Bạc Liêu": "dongBangSongCuuLong",
//     "Cà Mau": "dongBangSongCuuLong"
// };


const ScrapeInfomation = () => {
    const DOMAIN_CSDL = 'https://csdl.vietnamtourism.gov.vn'
    const DOMAIN_OSM = 'https://nominatim.openstreetmap.org';
    const DOMAIN_WIKI = 'https://vi.wikipedia.org/api/rest_v1/page/summary'
    const webviewRef = useRef<WebView>(null);
    // URI của webview, mặc định là trang tổng quan
    const [stringURI, setStringURI] = useState(`${DOMAIN_CSDL}/dest`);
    const [stringScript, setStringScript] = useState('');
    const [handleMessage, setHandleMessage] = useState<(event: WebViewMessageEvent) => void>(() => () => { })

    const [selectedCountry, setSelectedCountry] = useState('')
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
    const [dataProvinces, setDataProvinces] = useState<Province[]>([])
    const [pointIds, setPointIds] = useState<string[]>([]);
    const [currentIndexPointIds, setCurrentIndexPointIds] = useState(-1);
    const [currentIndexPage, setCurrentIndexPage] = useState(-1);
    const [currentIndexProvince, setCurrentIndexProvince] = useState(-1);
    const [dataProvincesCrawled, setDataProvincesCrawled] = useState<any[]>([])
    const [totalPage, setTotalPages] = useState(1)
    const [provinceUpdatedAt, setProvinceUpdatedAt] = useState(0);
    const [pointUpdatedAt, setPointUpdatedAt] = useState(0);
    const { dataCountries }: any = useHomeProvider();
    const { areasByProvinceName }: any = useAdminProvider()


    // SCRIPT 
    const scriptsToRun = {
        getTotalPages: `
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

        ,
        getIdsFromPage: `
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
        ,
        getDataProvinces: `
            (function() {
                const areasByProvinceName = ${JSON.stringify(areasByProvinceName)};
                const provinceSelect = document.getElementById("province");
                const options = provinceSelect ? provinceSelect.querySelectorAll("option") : [];
                const provinces = {};

                // Hàm chuẩn hóa chuỗi
                const myNormalize = (str) =>
                    str.replace(/Hoà/g, "Hòa").replace(/Thành phố\s*/gi, "").normalize("NFC").trim().replace(/\\s+/g, " ");

                options.forEach((option) => {
                    const key = option.value.trim();
                    const value = myNormalize(option.textContent);
                    // Bỏ qua nếu key rỗng hoặc chứa ký tự không hợp lệ
                    if (!key || /[.#$/[\]]/.test(key)) return;
                    const matchedArea = Object.entries(areasByProvinceName).find(([provinceName]) =>
                        myNormalize(value).includes(myNormalize(provinceName))
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
                        value: value
                    };
                });
                const webExtractedData = {
                    type: 'dataProvinces',
                    data:  provinces
                };
                window.ReactNativeWebView.postMessage(JSON.stringify(webExtractedData));
                })();
                true;
        `
        ,
        getDataPoint: `(function() {
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
        })(); true;`
    }


    // Lấy các tỉnh/ thành của quốc gia - XONG
    const fetchCityByCountry = useCallback(async (countryId: any) => {
        try {
            const refProvinces = ref(database, `cities/${countryId}`)
            const snapshot = await get(refProvinces);
            if (snapshot.exists()) {
                const dataRegions = snapshot.val() as Record<string, Record<string, Province>>;
                const dataProvincesArray: Province[] = Object.values(dataRegions)
                    .flatMap(item => Object.values(item))
                    .sort((a: Province, b: Province) => {
                        return a.value.localeCompare(b.value);
                    });
                // Thêm phần tử default
                dataProvincesArray.unshift(new Province());
                setDataProvinces(dataProvincesArray);

                setProvinceUpdatedAt(dataProvincesArray[1].updatedAt);
            } else {
                console.log("FetchCityByCountry: No data available1");
            }
        } catch (error) {
            console.error("FetchCityByCountry: Error fetching data: ", error);
        }
    }, [])

    // Lấy thời gian cập nhật cuối cùng của các địa điểm trong tỉnh
    const fetchUpdatedAtPoint = useCallback(async (pointId: string) => {
        try {
            const refUpdatedAt = ref(database, `pointsNew/${selectedCountry}/${pointId}/`)
            const firstPointQuery = query(refUpdatedAt, limitToFirst(1));
            const snapshot = await get(firstPointQuery);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const firstValue: any = Object.values(data)[0];
                setPointUpdatedAt(firstValue.updatedAt)
            }
        }
        catch (error) {
            console.error("Error fetching updatedAt point: ", error);
        }
    }, [selectedCountry])

    // Lấy kinh độ và vĩ độ của tỉnh/thành phố
    const fetchLatLong = useCallback(async (url: string) => {
        try {
            const response = await fetch(url, {
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

    // Update privince to firebase
    const updateProvinceToFirebase = useCallback(async (provinceData: Province, selectedCountry: string) => {
        const areaName = areasByProvinceName[provinceData.value]

        try {
            const refCountry = ref(database, `cities/${selectedCountry}/${areaName}/${provinceData.key}/`)
            await update(refCountry, provinceData)

            // Set scores mặc định là 0 nếu chưa có
            const refScores = ref(database, `cities/${selectedCountry}/${areaName}/${provinceData.key}/scores/`);
            const scoresSnapshot = await get(refScores);
            if (!scoresSnapshot.exists()) {
                // Nếu chưa có scores thì tạo mới mặc định là 9
                await set(refScores, 0);
                console.log("Added default score = 0");
            } else {
                console.log("Score already exists:", scoresSnapshot.val());
            }
        } catch (error) {
            console.error("Update data provinces: ", error);
        }
    }, [areasByProvinceName])

    // Lấy tuần tự kinh độ và vĩ độ các tỉnh
    const fetchProvincesLatLongSequentially = useCallback(async (provinces: any[]) => {
        for (let i = 0; i < provinces.length; i++) {
            const provinceObj = provinces[i];
            // Chuyển thành mảng [["10", { key: "10", value: "Lào Cai", information: "Chưa có thông tin" }]] và lấy phần tử đầu trong mảng
            const [proviceId, provinceData] = Object.entries(provinceObj)[0];
            //Ép kiểu
            const provinceDataImplicit = provinceData as Province

            // Chờ xong trước khi tiếp, location là object chứa key và value, 
            const provinceName = formatKeySearch(provinceDataImplicit.value)

            const keywords = ['Hòa Bình', 'Nam Định', 'Bình Định'];
            let url = `${DOMAIN_WIKI}/${(provinceName)}`

            if (provinceName === 'Hồ_Chí_Minh') {
                url = `${DOMAIN_WIKI}/Thành_phố_${(provinceName)}`
            } else if (keywords.some(k => provinceDataImplicit.value.includes(k.normalize("NFC")))) {
                url += '_(tỉnh)'
            }
            console.log(url, '-----', provinceName);


            try {
                const result = await fetchLatLong(url);
                if (result.type === 'standard') {
                    const provinceDataUpdated = {
                        ...provinceDataImplicit,
                        latitude: parseFloat(result.coordinates?.lat || 0),
                        longitude: parseFloat(result.coordinates?.lon || 0),
                        information: result.extract,
                        defaultImages: [result.originalimage.source || result.thumbnail.source],
                        updatedAt: Date.now()
                    };

                    // console.log(`${provinceDataImplicit.value}: lat=${result.coordinates?.lat || 0}, lon=${result.coordinates?.lon || 0}`);
                    await updateProvinceToFirebase(provinceDataUpdated, selectedCountry)
                } else {
                    console.log(`Không tìm thấy kết quả cho ${provinceDataImplicit}`);
                }

                if (i === provinces.length - 1) {
                    setProvinceUpdatedAt(Date.now())
                }
                // Delay 500ms để tránh spam API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
                console.error(`Lỗi với :`, error.message);
            }
        }

        // return updated
    }, [selectedCountry, updateProvinceToFirebase, fetchLatLong])

    // UPDATE provinces : Ghi lên firebase --- XONG
    // Data có dạng {'avietnam':[{'key':01, value:'TP Hà Nội'}, ...]}
    // const updateProvinces = useCallback(async (data: any, selectedCountry: string) => {
    //     try {
    //         const refProvinces = ref(database, `provinces/${selectedCountry}/`)
    //         // console.log(JSON.stringify(data, null, 2), 'pipip');
    //         await update(refProvinces, data)
    //     } catch (error) {
    //         console.error("Update data provinces: ", error);
    //     }
    // }, [])

    // Xử lý sự kiện khi chọn quốc gia --- XONG
    const handleSelectedCountry = useCallback((val: any) => {
        if (!val) return // Dùng khi có default 

        if (val == 'avietnam') {
            fetchCityByCountry(val)
        }
        else {
            Alert.alert('Chưa hỗ trợ quốc gia này');
            setDataProvinces([]);
            setProvinceUpdatedAt(0);
        }
        // Vẫn luôn set selected == val
        setSelectedCountry(val)
        // Reset when changing country
        setCurrentIndexPage(-1)
        setCurrentIndexPointIds(-1)
        setSelectedProvince(new Province());
        setPointUpdatedAt(0)
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
            setStringScript(scriptsToRun.getTotalPages);

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
        fetchUpdatedAtPoint(val)
    }, [dataProvinces, selectedCountry, fetchUpdatedAtPoint]);

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

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn làm mới dữ liệu hiện tại. Quá trình sẽ tốn nhiều thời gian.',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: () => {
                        // {'avietnam':[{key:'01',value:'Thành phố Hà Nội'},...]}
                        // XONG
                        const crawlScriptProvinces = scriptsToRun.getDataProvinces;

                        webviewRef.current?.injectJavaScript(crawlScriptProvinces);
                        setHandleMessage(() => (event: WebViewMessageEvent) => {
                            const message = JSON.parse(event.nativeEvent.data);
                            // console.log(message.data, 'provinces');
                            // Khác con trỏ dù data giống nhau
                            console.log(message.data, 'che');

                            const arrayFormat = Object.entries(message.data).map(([key, value]) => ({
                                // [key]: String(value).normalize('NFC')
                                [key]: value // value là một object chứa thông tin
                            }));
                            // console.log(arrayFormat,'ss');

                            setDataProvincesCrawled(arrayFormat || []);
                        });
                    },
                },
            ]
        );
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
            const script = scriptsToRun.getIdsFromPage;
            webviewRef.current?.injectJavaScript(script);
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIds = message.data;
                setPointIds(pointIds ? pointIds : []);
                // Set để ghi dữ liệu lên firebase luôn 
                console.log(currentIndexPointIds, 'curent');
                console.log(pointIds, 'total ids');

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

    // Update lên firebase từng địa điểm theo từng lần crawl data của địa điểm đó
    const updatePointData = useCallback(async (data: Point, selectedCountry: string, selectedProvinceId: string) => {
        const stringQuery = extractFullLocationSlug(data.address);
        const urlOpenStreetMap = `${DOMAIN_OSM}/search?q=${encodeURIComponent(stringQuery)}&format=json`
        const resultFetched = await fetchLatLong(urlOpenStreetMap);
        let latLongData: Geocode[] = [];
        if (resultFetched.length > 0) {
            latLongData = resultFetched.map((item: any) => ({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon)
            }))
        } else {
            latLongData.push({ latitude: 0, longitude: 0 })
        }

        // Cập nhật thời gian mới nhất ở layout
        if (currentIndexPointIds == pointIds.length - 1) {
            setPointUpdatedAt(data.updatedAt)
        }

        const dataUpdated = {
            [data.id]: {
                ...data.toJSON(),
                geocode: latLongData || [{ latitude: 0, longitude: 0 }]
            }
        }

        try {
            const refPointsNew = ref(database, `pointsNew/${selectedCountry}/${selectedProvinceId}/`);

            await update(refPointsNew, dataUpdated);
            console.log("call up to fb");
        } catch (error) {
            console.error("Update data pointsNew: ", error);
        }
    }, [currentIndexPointIds, pointIds])

    // Hàm chạy script theo index và update dữ liệu crawl về lên firebase
    const autoRunScriptCrawlPointData = useCallback((pointId: string, selectedCountry: string, selectedProvinceId: string) => {
        setHandleMessage(() => async (event: WebViewMessageEvent) => {
            const message = JSON.parse(event.nativeEvent.data);
            const crawledData = message.data
            const point = new Point(
                pointId,
                crawledData.address,
                crawledData.content,
                crawledData.end,
                [],
                crawledData.images,
                // crawledData.latitude,
                // crawledData.longitude,
                crawledData.start,
                crawledData.title,
            )

            // Xu li
            if (message.type === 'dataPoint') {
                console.log('Crawl data thành công cho id:', pointId);

                await updatePointData(point, selectedCountry, selectedProvinceId)
            }
            setCurrentIndexPointIds(prev => prev + 1); // sang item tiếp theo
        });
        // Gán lại callback inject JS
        setStringScript(scriptsToRun.getDataPoint);

        // Gán lại callback nhận message
        setStringURI(`${DOMAIN_CSDL}/dest/?item=${pointId}`);
    }, [updatePointData])

    // Hàm script theo currentPageIndex để lấy tất cả pointId
    const autoRunScriptCrawlPointIdsAllPage = useCallback((currentIndexPage: number) => {
        const script = scriptsToRun.getIdsFromPage;
        if (currentIndexPage == 0) {

            // Script lấy tất cả id
            webviewRef.current?.injectJavaScript(script);
            setHandleMessage(() => (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIds = message.data;
                // Lấy tất cả pointId của trang đầu tiên bỏ vào mảng
                setPointIds(pointIds ? pointIds : []);
                // Set qua trang tiep theo
                setCurrentIndexPage(currentIndexPage + 1)
            });
        } else {
            setHandleMessage(() => async (event: WebViewMessageEvent) => {
                const message = JSON.parse(event.nativeEvent.data);
                const pointIdsTemp = message.data; // luôn là mảng vì webview trả về mảng rỗng
                // Gộp tất cả các id lại và lọc ra phần tử trùng nhau
                setPointIds(prev => Array.from(new Set([...prev, ...pointIdsTemp])));
                setCurrentIndexPage(currentIndexPage + 1)
            });
            // Không cần set lại script vì vẫn còn script cũ
            setStringScript(script)
            setStringURI(`${DOMAIN_CSDL}/dest/?province=${selectedProvince?.key}&page=${currentIndexPage + 1}`)
        }
    }, [selectedProvince])

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
        console.log('here');
        // Thực hiện crawl longitude và latitude cho từng tỉnh
        // const updateToFirebase = async () => {
        //     // Chỉ lấy 3 tỉnh đầu tiên để tránh quá tải
        //     const updated = await fetchProvincesLatLongSequentially(dataProvincesCrawled.slice(0, 3))

        //     // const updated = await fetchProvincesLatLongSequentially(dataProvincesCrawled)
        //     const dataUpdate = { data: updated, updatedAt: Date.now() }
        //     await updateProvinces(dataUpdate, selectedCountry ? selectedCountry : 'unknown');
        //     // Lấy lại thời gian cập nhật
        //     fetchCityByCountry(selectedCountry)
        // }
        // Mở này ra để chạy bình thường
        // updateToFirebase();
        // fetchProvincesLatLongSequentially(dataProvincesCrawled.slice(0, 7))
        fetchProvincesLatLongSequentially(dataProvincesCrawled)
    }, [dataProvincesCrawled]);

    // Script này để lấy tất cả pointId qua từng trang
    useEffect(() => {
        // console.log('cur-total', currentIndexPage, totalPage);
        if (currentIndexPage === -1 || selectedProvince?.key == '-1' || selectedCountry !== 'avietnam') return;

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
            <View style={[styles.row]}>
                {/* <View style={[styles.row, { justifyContent: 'space-around', margin: 0, gap: 0, }]}> */}
                <View style={styles.wrapLabelModalFilter}>
                    <Text style={styles.textLabelModalFilter}>Quốc gia</Text>
                    <FontAwesome name="globe" size={20} color={iconColors.green1} />
                </View>
                <View style={styles.wrapLabelModalFilter}>
                    <Text style={styles.textLabelModalFilter}>Tỉnh/Thành phố</Text>
                    <FontAwesome6 name="tree-city" size={18} color={iconColors.green1} />
                </View>
                {/* </View> */}
            </View>

            <View style={[styles.row, { gap: 10, padding: 10 }]}>
                <View style={[{ flex: 1 }]}>
                    <SelectList
                        dropdownStyles={{
                            zIndex: 10,
                            position: "absolute",
                            width: '100%',
                            backgroundColor: "white",
                            top: 40,
                        }}
                        // boxStyles={{ width: 150 }}
                        setSelected={(val: any) => handleSelectedCountry(val)}
                        data={dataCountries}
                        save="key"
                        placeholder='Chưa chọn'
                        searchPlaceholder='Nhập tìm'
                        notFoundText='Không tìm thấy quốc gia'
                    />
                </View>

                <View style={[{ flex: 1 }]}>
                    <SelectList
                        key={selectedCountry}
                        dropdownStyles={{
                            zIndex: 10,
                            position: "absolute",
                            width: '100%',
                            backgroundColor: "white",
                            top: 40,
                        }}
                        // boxStyles={{ width: 200, }}
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

            <View style={[styles.row, { gap: 10, padding: 10 }]}>
                <TouchableOpacity
                    // disabled={selectedCountry == 'avietnam' ? false : true}
                    style={[styles.btn, selectedCountry == 'avietnam' ? {} : { backgroundColor: iconColors.green2, }]}
                    onPress={handleTapOnUpdateProvincesButton}>
                    <Text style={[styles.textButton, selectedCountry == 'avietnam' ? { color: 'white' } : { color: 'grey' }]}>Cập nhập tỉnh thành</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    // style={[styles.btn]}
                    style={[styles.btn, selectedCountry == 'avietnam' && selectedProvince?.key != '-1' ? {} : { backgroundColor: iconColors.green2, }]}
                    onPress={handleTapOnUpdateOneCityButton} >
                    <Text style={[styles.textButton, selectedProvince?.key == '-1' ? { color: 'grey' } : { color: 'white' }]}>Cập nhập địa điểm</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                    disabled={selectedCountry == 'avietnam' ? false : true}
                    style={styles.btn}
                    onPress={() => console.log('Cập nhật tất cả')}>
                    <Text>Cập nhập tất cả</Text>
                </TouchableOpacity> */}
            </View >
            <View style={[{ padding: 10 }]}>
                <Text>Dữ liệu các tỉnh thành của {selectedCountry == 'avietnam' ? dataCountries.find((item: any) => selectedCountry == item.key).value : '...'}: {provinceUpdatedAt != 0 ? (formatDate1(provinceUpdatedAt)) : ' , .../.../...'} </Text>
                {/* <Text>Dữ liệu tất cả địa điểm cập nhật lúc: </Text> */}
                {/* {selectedProvince && } */}
                <Text>Những địa điểm của {selectedProvince?.key == '-1' ? '...' : selectedProvince?.value}: {pointUpdatedAt != 0 ? (formatDate1(pointUpdatedAt)) : ' , .../.../...'} </Text>
            </View>

            {/* <View style={{ flex: 0.5 }}>

            </View> */}

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
    textButton: {
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16
    },
    // Modal filter
    wrapLabelModalFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 6,
        flex: 1
    },
    textLabelModalFilter: {
        fontWeight: '500',
        marginVertical: 8,
        marginRight: 4,
        // backgroundColor:'green'
    },
    btn: {
        flexDirection: 'row',
        flex: 1,
        width: 120,
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: iconColors.green1,
        // margin: 10,
        elevation: 4
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})