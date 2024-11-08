import { auth, database, onValue, ref, set } from '@/firebase/firebaseConfig';
import { AntDesign, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { push } from '@firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { Button, Checkbox, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';


const Payment = () => {
    const accountId = "BXGDUZhaxoQ6BLEoC6rLv6WWEOn1";
    //Payment
    const [qrDataURL, setQrDataURL] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleFilter, setIsVisibleFilter] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [statusContent, setStatusContent] = useState([]);
    const [dataExchanges, setDataExchanges] = useState([]);
    let [dataExchangesFilter, setDataExchangesFilter] = useState([]);
    const [name, setName] = useState('')
    //Modal filter
    const [timeStart, setTimeStart] = useState<any>(null);
    const [timeEnd, setTimeEnd] = useState<any>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const statusOptions = [{ id: "1", value: "Pending" }, { id: "2", value: "Success" }, { id: "3", value: "Failure" }];
    const typeOptions = ["Deduction", "Recharge"];
    const today = new Date();

    // Status content
    useEffect(() => {
        const onValueChange = ref(database, 'status/payment');
        const statusContentListener = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                setStatusContent(jsonData);
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => statusContentListener();
    }, []);
    // Name account
    useEffect(() => {
        const onValueChange = ref(database, `accounts/${accountId}`);
        const name = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                setName(jsonData.fullname)
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => name();
    }, []);

    // Exchange data by account id
    useEffect(() => {
        const onValueChange = ref(database, 'exchanges');
        const exchangesListener = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                const dataArray = Object.values(jsonData);
                const data: any = dataArray.filter((item: any) => item.account_id === accountId).sort((a: any, b: any) => {
                    if (a.status_id == b.status_id) {
                        return b.created_at - a.created_at
                    }
                    return a.status_id - b.status_id
                });
                const aaa = data
                setDataExchanges(data);

            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => exchangesListener();
    }, []);

    //Exchange data filter realtime
    useEffect(() => {
        if (timeEnd == null) {
            setDataExchangesFilter(dataExchanges)
        }
        else {
            handleFilter()
        }
        // setDataExchangesFilter(data)
    }, [dataExchanges])

    const closeDialog = () => {
        handleAddRequest();
        setIsVisible(false);
        setIsVisibleFilter(false);
        setQrDataURL(null);
        setIsDisabled(true);
        setInputText('');
    };

    //Fetch QR
    const fetchQRCode = async () => {

        const rawValue = parseFloat(inputText.replace(/\D/g, ''));
        try {
            setLoadingQR(true)
            const response = await fetch('https://api.vietqr.io/v2/generate', {
                method: 'POST',
                headers: {
                    'x-client-id': '49602963-e192-4c04-a043-cbc7386d1f2c',
                    'x-api-key': '<6781212f-ed4d-4575-8b5a-22aeca40eceb>',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accountNo: '0381000534713',
                    accountName: 'Tran Thi Anh Thu',
                    acqId: '970436',
                    addInfo: `${accountId} ${inputText} ${Date.now()}`,
                    amount: rawValue,
                    template: 'compact'
                })
            });

            const data = await response.json();
            setIsVisible(true);

            if (response.ok) {
                setQrDataURL(data.data.qrDataURL);
            } else {
                setError(data.desc || 'An error occurred');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoadingQR(false);
        }
    };

    //Balance Realtime
    useEffect(() => {
        const onValueChange = ref(database, `accounts/${accountId}`);
        const reportListener = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                setBalance(jsonData.balance);
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => reportListener();
    }, []);

    const handleTextChange = (text: any) => {
        // Remove non-numeric characters to ensure clean parsing
        const numericValue = parseFloat(text.replace(/\D/g, ''));

        if (!isNaN(numericValue)) {
            // Format as a string with thousand separators
            const formattedText = numericValue.toLocaleString('vi-VN');
            setInputText(formattedText);
        } else {
            setInputText('');
        }
    };

    //Enable Request button
    useEffect(() => {
        inputText.length > 4 ? setIsDisabled(false) : setIsDisabled(true);
    }, [inputText]);

    const handleRequest = () => {
        if (!isDisabled) {
            fetchQRCode();
        }
    };

    const handleAddRequest = async () => {
        const exchangeRef = ref(database, 'exchanges');
        const newItemKey = push(exchangeRef);
        const rawValue = parseFloat(inputText.replace(/\D/g, ''));
        const item = {
            account_id: accountId,
            created_at: Date.now(),
            id: newItemKey.key,
            name: name,
            payment: rawValue,
            status_id: "1"
        };

        await set(newItemKey, item)
            .then(() => {
                console.log('Data added successfully');
            })
            .catch((error) => {
                console.error('Error adding data: ', error);
            });
    };

    const renderExchange = (exchange: any) => {
        const timestamp = exchange.item.created_at;
        const timeCreatedAt = new Date(timestamp);
        return (
            <View style={styles.exchangeItem}>
                <Text style={styles.timestamp}>
                    {`${timeCreatedAt.toLocaleDateString()} ${timeCreatedAt.toLocaleTimeString()}`}
                </Text>
                <View >
                    <Text style={styles.paymentAmount}>{exchange.item.payment > 0 ? '+' + exchange.item.payment.toLocaleString('vi-VN') : exchange.item.payment.toLocaleString('vi-VN')}</Text>
                    <Text style={[styles.paymentStatus, { color: exchange.item.status_id === "1" ? '#FFD700' : exchange.item.status_id === "2" ? 'green' : 'red' }]} >{statusContent[exchange.item.status_id]}</Text>
                </View>
            </View>
        );
    };

    //Modal

    const handleSelect = (option: any, list: any, setList: any) => {
        console.log(option);

        setList((prev: any) =>
            prev.includes(option) ? prev.filter((item: any) => item !== option) : [...prev, option]
        );
    };

    const onChangeStartDate = (event: any, selectedDate: any) => {
        setShowStartPicker(false);
        if (selectedDate) {
            // Check if start date is greater than today
            if (selectedDate > today) {
                Alert.alert("Error", "The end date cannot be greater than today.");
            }
            // Check if start date is greater than end date
            else if (timeEnd && selectedDate > timeEnd) {
                Alert.alert("Error", "The start date cannot be later than the end date.");
            } else {
                setTimeStart(selectedDate);
            }
        }
    };

    const onChangeEndDate = (event: any, selectedDate: any) => {
        setShowEndPicker(false);

        if (selectedDate) {
            // Check if end date is greater than today
            if (selectedDate > today) {
                Alert.alert("Error", "The end date cannot be greater than today.");
            }
            // Check if end date is earlier than start date
            else if (timeStart && selectedDate < timeStart) {
                Alert.alert("Error", "The end date cannot be earlier than the start date.");
            } else {
                setTimeEnd(selectedDate);
            }
        }
    };

    const closeDialogFilter = () => {
        setIsVisibleFilter(false);
    };
    const openDialogFilter = () => {
        setIsVisibleFilter(true);
    };

    const handleFilter = () => {
        if (timeStart && timeEnd) {
            setLoadingFilter(true); // Bắt đầu hiệu ứng loading
            setTimeout(() => {
                const filteredData = dataExchanges.filter((item: any) => {
                    //Neu ngay ket thuc la ngay hom nay thi lay tai thoi diem filter, neu la ngay trc do thi lay cuoi ngay
                    const timeEndDate = (timeEnd.setHours(23, 59, 59, 999) == today.setHours(23, 59, 59, 999)) ? new Date(today).setHours(23, 59, 59, 999) : new Date(timeEnd).setHours(23, 59, 59, 999)
                    // Bat dau tu 0:0:0 cua ngay bat dau
                    const timeStartDate = new Date(timeStart).setHours(0, 0, 0, 0)
                    // Kiểm tra điều kiện thời gian, loại giao dịch và trạng thái giao dịch
                    const isWithinTimeRange = item.created_at >= timeStartDate && item.created_at <= timeEndDate;
                    const isStatusMatch = selectedStatus.length === 0 || selectedStatus.includes(item.status_id);
                    // Kiểm tra loại giao dịch
                    const isTypeMatch = selectedType.length === 0 ||
                        (selectedType.includes("Deduction") && item.payment < 0) || // Số âm cho Deduction
                        (selectedType.includes("Recharge") && item.payment > 0); // Số dương cho Recharge

                    return isWithinTimeRange
                        && isStatusMatch
                        && isTypeMatch
                        ;
                });
                //Set lai data cho filter
                setDataExchangesFilter(filteredData);
                closeDialogFilter()
                setLoadingFilter(false)
            }, 1000);
        } else {
            Alert.alert("Lỗi", "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.");
        }

    };

    const handleRefreshData = () => {
        setLoadingRefresh(true); // Bắt đầu hiệu ứng loading
        setTimeout(() => {
            setDataExchangesFilter(dataExchanges)
            setSelectedStatus('')
            setSelectedType('')
            setTimeEnd(null)
            setTimeStart(null)
            setLoadingRefresh(false)
        }, 1000)
    }

    return (
        <View style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Balance:</Text>
                <Text style={styles.balanceAmount}>{balance.toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.addBar}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={handleTextChange}
                    keyboardType='numeric'
                    maxLength={15}
                    placeholder='Enter an amount'
                />
                <TouchableOpacity
                    style={[styles.addBtn, isDisabled && styles.disabledBtn]}
                    onPress={handleRequest}
                    disabled={isDisabled}
                >
                    {loadingQR ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.addBtnText}>Request</Text>)}
                </TouchableOpacity>
            </View>
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeDialog}
            >
                <View style={styles.modalOverlay}>

                    <View style={styles.dialogContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeDialog}>
                            <MaterialIcons name="cancel" size={24} color="red" />

                        </TouchableOpacity>
                        <Text style={styles.dialogTitle}>Scan QR code</Text>
                        {qrDataURL ? (
                            <Image source={{ uri: qrDataURL }} style={styles.image} />
                        ) : (
                            <Text>No QR code available</Text>
                        )}
                        <Text style={styles.dialogText}>QR code has a one-time value only</Text>

                    </View>
                </View>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                {/* Refresh */}
                <TouchableOpacity onPress={handleRefreshData}>
                    {loadingRefresh ? (

                        <ActivityIndicator color="red" size={24} style={{ paddingRight: 10 }} />
                    ) : (
                        <SimpleLineIcons name="refresh" size={24} color="black" style={{ paddingRight: 10 }} />)}
                </TouchableOpacity>
                {/* Filter */}
                <TouchableOpacity onPress={openDialogFilter}>

                    <AntDesign name="filter" size={24} color={timeEnd != null ? "red" : "black"} />
                </TouchableOpacity>
                <Modal
                    visible={isVisibleFilter}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={closeDialog}
                >
                    <View style={styles.modalOverlay}>
                        {loadingFilter ? (
                            <ActivityIndicator color="white" size={100} />
                        ) : (
                            <View style={styles.dialogContainer}>

                                <TouchableOpacity style={styles.closeButton} onPress={closeDialog}>
                                    <MaterialIcons name="cancel" size={24} color="red" />
                                </TouchableOpacity>
                                <View style={{ padding: 5, width: '100%' }}>
                                    <Text style={{ fontSize: 20, marginBottom: 10 }}>Transaction Filter</Text>

                                    {/* Date pickers for time */}
                                    <Text style={{ fontWeight: 'bold' }}>Start Date</Text>
                                    <Button mode="outlined" onPress={() => setShowStartPicker(true)}>
                                        {timeStart ? timeStart.toLocaleDateString() : "Select Start Date"}
                                    </Button>
                                    {showStartPicker && (
                                        <DateTimePicker
                                            value={timeStart || new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onChangeStartDate}
                                        />
                                    )}

                                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>End Date</Text>
                                    <Button mode="outlined" onPress={() => setShowEndPicker(true)}>
                                        {timeEnd ? timeEnd.toLocaleDateString() : "Select End Date"}
                                    </Button>
                                    {showEndPicker && (
                                        <DateTimePicker
                                            value={timeEnd || new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onChangeEndDate}
                                        />
                                    )}

                                    <Divider style={{ marginVertical: 10 }} />

                                    {/* Transaction Status */}
                                    <Text style={{ fontWeight: 'bold' }}>Transaction Status</Text>
                                    {statusOptions.map((option: any) => (
                                        <View key={option} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Checkbox
                                                status={selectedStatus.includes(option.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleSelect(option.id, selectedStatus, setSelectedStatus)}
                                            />
                                            <Text>{option.value}</Text>
                                        </View>
                                    ))}

                                    <Divider style={{ marginVertical: 10 }} />

                                    {/* Transaction Type */}
                                    <Text style={{ fontWeight: 'bold' }}>Transaction Type</Text>
                                    {typeOptions.map((option, index) => (
                                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Checkbox
                                                status={selectedType.includes(option) ? 'checked' : 'unchecked'}
                                                onPress={() => handleSelect(option, selectedType, setSelectedType)}
                                            />
                                            <Text>{option}</Text>
                                        </View>
                                    ))}

                                    <Button
                                        mode="contained"
                                        style={{ marginTop: 20 }}
                                        onPress={handleFilter}
                                    >
                                        <Text>Apply Filters</Text>
                                    </Button>
                                </View>
                            </View>)}
                    </View>
                </Modal>
            </View>
            <View style={styles.divider} />

            <View style={styles.exchangeList}>
                {dataExchangesFilter.length > 0 ? (
                    <FlatList
                        data={dataExchangesFilter}
                        renderItem={renderExchange}
                    // keyExtractor={(item) => item.id}
                    />
                ) : (
                    <Text style={styles.noAccountsText}>No data</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f2f2f2',
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    balanceLabel: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    balanceAmount: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#5E8C31',
    },
    addBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    textInput: {
        height: 45,
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    addBtn: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5E8C31',
        borderRadius: 5,
        flexBasis: 100,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
    addBtnText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dialogTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    dialogText: {
        marginBottom: 20,
        textAlign: 'center',
    },
    saveButton: {
        padding: 10,
        backgroundColor: '#5E8C31',
        borderRadius: 5,
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 20,
    },
    exchangeList: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
    },
    exchangeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    timestamp: {
        fontSize: 14,
        color: '#888',
    },
    paymentAmount: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    paymentStatus: {
        fontSize: 12,
        color: '#5E8C31',
        textAlign: 'right'
    },
    noAccountsText: {
        textAlign: 'center',
        color: '#888',
    },
});

export default Payment;
