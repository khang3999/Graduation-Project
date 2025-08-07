import { auth, database, onValue, ref, set } from "@/firebase/firebaseConfig";
import { AntDesign, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { endBefore, push } from "@firebase/database";
import React, { useEffect, useState, useRef } from "react";
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import dayjs from 'dayjs';

import {
  View,
  Image,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { Button, Checkbox, Divider } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHomeProvider } from "@/contexts/HomeProvider";
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { useAccount } from "@/contexts/AccountProvider";

const Payment = () => {
  const [accountId, setAccountId] = useState("");
  // const { dataAccount }: any = useHomeProvider();
  const { dataAccount }: any = useAccount();
  const defaultStyles = useDefaultStyles();
  const [startDate, setStartDate] = useState<DateType>();
  const [endDate, setEndDate] = useState<DateType>();
  const [qrDataURL, setQrDataURL] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleQR, setIsVisibleQR] = useState(false);
  const [isVisibleFilter, setIsVisibleFilter] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [statusContent, setStatusContent] = useState([]);
  const [dataExchanges, setDataExchanges] = useState([]);
  let [dataExchangesFilter, setDataExchangesFilter] = useState([]);
  const [startFilterDeposit, setStartFilterDeposit] = useState(false)
  const [startFilterWithdraw, setStartFilterWithdraw] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('Nhập số tiền cần nạp');

  console.log("Account ID:", dataAccount.id);
  useEffect(() => {
    setAccountId(dataAccount.id)
  }, [dataAccount])
  // Status content
  useEffect(() => {
    const onValueChange = ref(database, "status/payment");
    const statusContentListener = onValue(
      onValueChange,
      (snapshot) => {
        if (snapshot.exists()) {
          const jsonData = snapshot.val();
          setStatusContent(jsonData);
        } else {
          console.log("No data available");
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    return () => statusContentListener();
  }, []);

  // Exchange data by account id
  useEffect(() => {
    if (accountId != "") {
      const onValueChange = ref(database, "exchanges");
      const exchangesListener = onValue(
        onValueChange,
        (snapshot) => {
          if (snapshot.exists()) {
            const jsonData = snapshot.val();
            const dataArray = Object.values(jsonData);
            const data: any = dataArray
              .filter((item: any) => item.account_id === accountId)
              .sort((a: any, b: any) => {
                if (a.status_id == b.status_id) {
                  return b.created_at - a.created_at;
                }
                return a.status_id - b.status_id;
              });
            setDataExchanges(data);
            setDataExchangesFilter(data)
          } else {
            console.log("No data available");
          }
        },
        (error) => {
          console.error("Error fetching data:", error);
        }
      );

      return () => {
        exchangesListener();
      };
    }
  }, [accountId]);

  const closeDialog = () => {
    setIsVisible(false);
    setIsVisibleQR(false);
    setIsVisibleFilter(false);
    setQrDataURL(null);
    setIsDisabled(true);
    setInputText("");
    handleFilter(dataExchanges, 3);
    setPlaceholderText("Nhập số tiền cần nạp");
  };

  //Fetch QR
  const fetchQRCode = async () => {
    const rawValue = parseFloat(inputText.replace(/\D/g, ""));
    try {
      // setLoadingQR(true);
      const response = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "x-client-id": "49602963-e192-4c04-a043-cbc7386d1f2c",
          "x-api-key": "<6781212f-ed4d-4575-8b5a-22aeca40eceb>",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNo: "0381000534713",
          accountName: "Tran Thi Anh Thu",
          acqId: "970436",
          addInfo: `${accountId} ${inputText} ${Date.now()}`,
          amount: rawValue,
          template: "compact",
        }),
      });

      const data = await response.json();
      setIsVisible(true);

      if (response.ok) {
        setQrDataURL(data.data.qrDataURL);
        handleAddRequest();
      } else {
        setError(data.desc || "An error occurred");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingQR(false);
    }
  };

  //Balance Realtime
  useEffect(() => {
    if (accountId) {
      const onValueChange = ref(database, `accounts/${accountId}`);
      const reportListener = onValue(
        onValueChange,
        (snapshot) => {
          if (snapshot.exists()) {
            const jsonData = snapshot.val();

            setBalance(jsonData.balance);
          } else {
            console.log("No data available");
          }
        },
        (error) => {
          console.error("Error fetching data:", error);
        }
      );

      return () => reportListener();
    }

  }, [accountId, dataExchanges]);

  const handleTextChange = (text: any) => {
    // Remove non-numeric characters to ensure clean parsing
    const numericValue = parseFloat(text.replace(/\D/g, ""));

    if (!isNaN(numericValue)) {
      // Format as a string with thousand separators
      const formattedText = numericValue.toLocaleString("vi-VN");
      setInputText(formattedText);
    } else {
      setInputText("");
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
    // Lưu giá trị cũ vào placeholder và clear input
    setPlaceholderText(inputText);
    setInputText('');
    setIsDisabled(true); // disable lại button

    // Giả lập delay xử lý
    // setTimeout(() => {
    //   setLoadingQR(false);
    //   // Optional: bạn có thể re-enable sau khi xử lý xong
    // }, 1500);
  };

  // Them yeu cau nap tien vao bang Exchange
  const handleAddRequest = async () => {
    const exchangeRef = ref(database, "exchanges");
    const newItemKey = push(exchangeRef);
    const rawValue = parseFloat(inputText.replace(/\D/g, ""));
    const item = {
      account_id: accountId,
      created_at: Date.now(),
      id: newItemKey.key,
      name: dataAccount.fullname,
      payment: rawValue,
      status_id: 1,
    };
    await set(newItemKey.ref, item)
      .then(() => {
        console.log("Data added successfully");
      })
      .catch((error) => {
        console.error("Error adding data: ", error);
      });
  };

  //Render du lieu
  const renderExchange = (exchange: any) => {
    const timestamp = exchange.item.created_at;
    const timeCreatedAt = new Date(timestamp);
    return (
      <View style={styles.exchangeItem}>
        <Text style={styles.timestamp}>
          {`${timeCreatedAt.toLocaleDateString()} ${timeCreatedAt.toLocaleTimeString()}`}
        </Text>
        <View>
          <Text style={styles.paymentAmount}>
            {exchange.item.payment > 0
              ? "+" + exchange.item.payment.toLocaleString("vi-VN")
              : exchange.item.payment.toLocaleString("vi-VN")}
          </Text>
          <Text
            style={[
              styles.paymentStatus,
              {
                color:
                  exchange.item.status_id === 1
                    ? "#FFD700"
                    : exchange.item.status_id === 2
                      ? "green"
                      : "red",
              },
            ]}
          >
            {statusContent[exchange.item.status_id]}
          </Text>
        </View>
      </View>
    );
  };

  //Modal

  const closeDialogFilter = () => {
    setIsVisibleFilter(false);
  };
  const openDialogFilter = () => {
    setIsVisibleFilter(true);
  };
  const openDialogQR = () => {
    setQrDataURL(null)
    setLoadingQR(true);
    setIsVisibleQR(true);
  };
  const onPressFilterDeposit = () => {
    console.log("Deposit on - Withdraw off");
    handleFilter(dataExchanges, 1)
  }
  const onPressFilterWithdraw = () => {
    console.log("Withdraw on - Deposit off");
    handleFilter(dataExchanges, 2)
  }
  const filterLogic = (item: any, typeFilter: number) => {
    // dayjs(startDate).startOf('day').valueOf() dua ve timestamp 00:00:00 dd/mm/yyyy
    if (startDate && endDate) {
      if (item.created_at >= dayjs(startDate).startOf('day').valueOf() && item.created_at <= dayjs(endDate).endOf('day').valueOf()) {
        switch (typeFilter) {
          case 1: return item.payment > 0
          case 2: return item.payment < 0
          case 3: return item
        }
      }
    }
    else {
      switch (typeFilter) {
        case 1: return item.payment > 0
        case 2: return item.payment < 0
        case 3: return item
      }
    }
  };
  const handleFilter = (dataExchanges: any, typeFilter: number) => {
    setTimeout(() => {
      const filteredData = dataExchanges.filter((item: any) => filterLogic(item, typeFilter));
      console.log(filteredData, " aaa");

      setDataExchangesFilter(filteredData);
      setLoadingFilter(false);
    }, 1000);
  };
  //Refresh button
  const handleRefreshData = () => {
    setLoadingRefresh(true); // Bắt đầu hiệu ứng loading
    setTimeout(() => {
      setDataExchangesFilter(dataExchanges);
      setEndDate(null)
      setStartDate(null)
      setLoadingRefresh(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.row}>
        <View style={styles.row}>
          <Image
            source={{ uri: dataAccount.avatar }}
            style={styles.miniAvatar}
          />
          <View style={styles.column}>
            <Text style={styles.username}>{dataAccount.fullname}</Text>
            <Text style={styles.time}>Welcome back</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.row} onPress={openDialogQR}>
          <Image source={require('../../assets/images/add-payment.png')} style={styles.iconAddPayment} />
        </TouchableOpacity>
        <Modal
          visible={isVisibleQR}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDialog}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dialogContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={closeDialog}>
                <MaterialIcons name="cancel" size={24} color="red" />
              </TouchableOpacity>
              <Text style={styles.dialogTitle}>Quét mã QR</Text>
              <View style={styles.addBar}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={handleTextChange}
                  keyboardType="numeric"
                  maxLength={15}
                  placeholder={placeholderText}
                />
                <TouchableOpacity
                  style={[styles.addBtn, isDisabled && styles.disabledBtn]}
                  onPress={handleRequest}
                  disabled={isDisabled}
                >
                  {loadingQR ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.addBtnText}>Yêu cầu</Text>
                  )}
                </TouchableOpacity>

              </View>
              {qrDataURL ? (
                <Image source={{ uri: qrDataURL }} style={styles.image} />
              ) : (
                <Image source={require('../../assets/images/qrdefault.png')} style={styles.image} />
              )}
              <Text style={styles.dialogText}>
                Mã QR chỉ có giá trị một lần
              </Text>
            </View>
          </View>
        </Modal>
      </View>
      {/* balance */}
      <View>
        <Text style={styles.balanceAmount}> {balance.toLocaleString("vi-VN")} <Text style={{ fontSize: 15 }}>VND</Text></Text>
      </View>
      {/* Option */}
      <View style={[styles.row, { padding: 10 }]}>
        {/* Deposit */}
        <View style={[styles.column]}>
          <TouchableOpacity style={styles.iconOptionCircle} onPress={onPressFilterDeposit}>
            <Image
              source={require('../../assets/images/increase.png')}
              style={styles.iconOption}
            />
          </TouchableOpacity>
          <Text style={styles.titleOptionCircle}>
            Deposit
          </Text>
        </View>

        {/* Withdraw */}
        <View style={[styles.column]}>
          <TouchableOpacity style={styles.iconOptionCircle} onPress={onPressFilterWithdraw}>
            <Image
              source={require('../../assets/images/decrease.png')}
              style={styles.iconOption}
            />
          </TouchableOpacity>
          <Text style={styles.titleOptionCircle}>
            Withdraw
          </Text>
        </View>

        {/* Refresh */}
        <View style={[styles.column]}>
          <TouchableOpacity onPress={handleRefreshData} style={styles.iconOptionCircle}>
            {loadingRefresh ? (
              <ActivityIndicator
                color="red"
                size={40}
              />
            ) : (
              <SimpleLineIcons
                name="refresh"
                size={40}
                color="black"
              // style={{ paddingRight: 10 }}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.titleOptionCircle}>
            Refresh
          </Text>
        </View>
      </View>

      {/* Datepicker */}
      <TouchableOpacity onPress={openDialogFilter} style={[styles.touchableDatePicker]}>
        {/* <Text style={{ fontSize: 20 }}>
          {(startDate ? ((new Date(startDate.toString())).toLocaleDateString("vi-VN")) : (new Date).toLocaleDateString("vi-VN")) + " - " + (endDate ? ((new Date(endDate.toString())).toLocaleDateString("vi-VN")) : (new Date).toLocaleDateString("vi-VN"))}
        </Text> */}
        <Text style={{ fontSize: 20 }}>
          {(startDate && endDate ? ((new Date(startDate.toString())).toLocaleDateString("vi-VN") + " - " + (new Date(endDate.toString())).toLocaleDateString("vi-VN")) : "Tất cả giao dịch")}
        </Text>
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
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeDialog}
              >
                <MaterialIcons name="cancel" size={24} color="red" />
              </TouchableOpacity>
              <View style={{ marginTop: 40 }}>
                <DateTimePicker
                  mode="range"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={({ startDate, endDate }) => {
                    setStartDate(startDate), setEndDate(endDate), console.log(endDate?.toLocaleString("vi-VN"));
                  }}
                  styles={{
                    ...defaultStyles,
                    today: { borderColor: 'blue', borderWidth: 1 }, // Add a border to today's date
                    selected: { backgroundColor: 'blue' }, // Highlight the selected day
                    selected_label: { color: 'white' }, // Highlight the selected day label
                  }}
                  disabledDates={(date: any) => date > new Date()}
                  // showOutsideDays={true}
                  weekdaysFormat={"short"}
                  // timeZone="UTC"
                  firstDayOfWeek={1}
                  min={1}
                  max={31}

                />

              </View>

            </View>
          )}
        </View>
      </Modal>
      {/* <View style={styles.divider} /> */}

      <View style={styles.exchangeList}>
        {dataExchangesFilter.length > 0 ? (
          <FlatList
            data={dataExchangesFilter}
            renderItem={renderExchange}
          // keyExtractor={(item) => item.id}
          />
        ) : (
          <Text style={styles.noAccountsText}>Chưa có dữ liệu</Text>
        )}
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 40,
    backgroundColor: "#eaf7ec",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 30,
    fontWeight: "bold",
  },
  balanceAmount: {
    fontSize: 50,
    fontWeight: "500",
    color: 'black',
    textAlign: 'center',
    paddingVertical: 30
  },
  addBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  textInput: {
    height: 45,
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addBtn: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5E8C31",
    borderRadius: 5,
    flexBasis: 100,
  },
  disabledBtn: {
    backgroundColor: "#ccc",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialogContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  dialogText: {
    marginBottom: 20,
    textAlign: "center",
  },
  saveButton: {
    padding: 10,
    backgroundColor: "#5E8C31",
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
  },
  exchangeList: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 40,
    marginTop: 20,
  },
  exchangeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timestamp: {
    fontSize: 14,
    color: "#888",
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: "bold",
  },
  paymentStatus: {
    fontSize: 12,
    color: "#5E8C31",
    textAlign: "right",
  },
  noAccountsText: {
    textAlign: "center",
    color: "#888",
  },
  miniAvatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  iconAddPayment: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  iconOption: {
    width: 40,
    height: 40,

  },
  iconOptionCircle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#74d65f',
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  titleOptionCircle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "500",
    padding: 10
  },
  touchableDatePicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#74d65f',
    borderStyle: "solid",
    padding: 20,
  }
  ,
  username: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: "bold",
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

  },
  time: {
    marginLeft: 10,
    color: "grey",
  },
});

export default Payment;













