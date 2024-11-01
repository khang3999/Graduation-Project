import { auth, database, onValue, ref, set } from '@/firebase/firebaseConfig';
import { push } from '@firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';



const Payment = () => {
    const [qrDataURL, setQrDataURL] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [statusContent, setStatusContent] = useState([]);
    const [dataExchanges, setDataExchanges] = useState([]);
    const [name, setName] = useState('')

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
                const data: any = dataArray.filter((item: any) => item.account_id === accountId).sort((a: any, b: any) => b.created_at - a.created_at);
                setDataExchanges(data);
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => exchangesListener();
    }, []);

    const closeDialog = () => {
        handleAddRequest();
        setIsVisible(false);
        setQrDataURL(null);
        setIsDisabled(true);
        setInputText('');
    };



    const accountId = "5qhADrzF93h7oDpo0iYfAVsfYpN2";

    const fetchQRCode = async () => {
        const rawValue = parseFloat(inputText.replace(/\D/g, ''));
        try {
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
            setLoading(false);
        }
    };

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
                    placeholder='Enter an amount'
                />
                <TouchableOpacity
                    style={[styles.addBtn, isDisabled && styles.disabledBtn]}
                    onPress={handleRequest}
                    disabled={isDisabled}
                >
                    <Text style={styles.addBtnText}>Request</Text>
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
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.dialogTitle}>Scan QR code</Text>
                        {qrDataURL ? (
                            <Image source={{ uri: qrDataURL }} style={styles.image} />
                        ) : (
                            <Text>No QR code available</Text>
                        )}
                        <Text style={styles.dialogText}>QR code has a one-time value only</Text>
                        {/* <TouchableOpacity style={styles.saveButton}  >
                            <Text style={styles.saveButtonText}>Save Image</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>
            <View style={styles.divider} />
            <View style={styles.exchangeList}>
                {dataExchanges.length > 0 ? (
                    <FlatList
                        data={dataExchanges}
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
