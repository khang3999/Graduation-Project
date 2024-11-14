import { View, Text, Alert, StyleSheet, FlatList, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { database, onValue, ref ,get} from '@/firebase/firebaseConfig';
import { update } from '@firebase/database';
import { Feather } from '@expo/vector-icons';

// Helper function to format date
const formatDate = (timestamp: any) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Exchange = () => {
  const [inputText, setInputText] = useState('');
  const [dataExchanges, setDataExchanges] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  let balance = 0

  useEffect(() => {
    const onValueChange = ref(database, 'exchanges');
    const exchanges = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const dataArray: any = Object.values(jsonData);
        const dataPending = dataArray.sort((a: any, b: any) => {
          if (b.status_id == a.status_id) {
            return b.created_at - a.created_at
          }
          return a.status_id - b.status_id
        });
        setDataExchanges(dataPending);
        console.log(dataPending);
        
      } else {
        setDataExchanges([]);
        setFilteredData([]);
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => exchanges();
  }, []);

  useEffect(() => {
    setFilteredData(dataExchanges);
  }, [dataExchanges]);

  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  useEffect(() => {
    const filtered = dataExchanges.filter((item: any) =>
      item.name.toLowerCase().includes(inputText.toLowerCase())
    );

    setFilteredData(filtered);
    setIsDisabled(filtered.length > 0 && filtered.some((item: any) => item.name === inputText));
  }, [inputText]);

  const approvePayment = (payment: any) => {
    const refExchanges = ref(database, `exchanges/${payment.id}`);
    const refAccount = ref(database, `accounts/${payment.account_id}`);
    
    Alert.alert(
      "Approve payment",
      "Are you sure you want to approve payment for this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            // Update status exchange
            update(refExchanges, { status_id: "2" })
              .then(() => {
                console.log('Exchange status updated successfully!');
                
                // Get balance of account (one-time read)
                get(refAccount)
                  .then((snapshot) => {
                    if (snapshot.exists()) {
                      const jsonData = snapshot.val();
                      const newBalance = jsonData.balance + payment.payment;
  
                      // Update balance of account
                      update(refAccount, { balance: newBalance })
                        .then(() => {
                          console.log('Account balance updated successfully!');
                        })
                        .catch((error) => {
                          console.error('Error updating balance:', error);
                        });
                    } else {
                      console.log("No account data available");
                    }
                  })
                  .catch((error) => {
                    console.error("Error fetching account data:", error);
                  });
              })
              .catch((error) => {
                console.error('Error updating exchange status:', error);
              });
          }
        }
      ]
    );
  };
  
  

  const rejectPayment = (paymentId: any) => {
    const refExchanges = ref(database, `exchanges/${paymentId}`);
    Alert.alert(
      "Reject payment ",
      "Are you sure you want to reject payment for this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            update(refExchanges, { status_id: "3" })
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          }
        }
      ]
    );
  };

  const renderIcon = (exchange: any) => {
    return (
      <View style={styles.iconContainer}>
        {exchange.status_id === "1" && (
          <>
            <Feather name="check-square" size={24} color="green" onPress={() => approvePayment(exchange)} style={{ paddingBottom: 10 }} />
            <Feather name="x-square" size={25} color="red" onPress={() => rejectPayment(exchange.id)} />
          </>
        )}
        {exchange.status_id === "2" && (
          <Feather name="check-square" size={24} color="gray" disabled={true} />
        )}
        {exchange.status_id === "3" && (
          <Feather name="x-square" size={25} color="gray" disabled={true} />
        )}
      </View>
    );
  };

  const renderExchangeItem = (exchange: any) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemDetails}>
          <Text style={styles.fullName}>{exchange.item.name}</Text>
          <View >
            <Text style={styles.time}>{formatDate(exchange.item.created_at)}</Text>
            <Text style={styles.accountId}>{exchange.item.account_id}</Text>
          </View>
        </View>
        <View style={styles.paymentContainer}>
          <Text style={styles.payment}>{exchange.item.payment}</Text>
          {renderIcon(exchange.item)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.addBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder='Search by name'
        />
      </View>
      <View style={styles.container}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderExchangeItem}
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
  mainContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777',
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
  },
  item: {
    backgroundColor: '#fff',
    padding: 24, // Increased padding for better spacing
    marginBottom: 20, // Increased spacing between items
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  fullName: {
    fontSize: 20, // Increased font size for the name
    fontWeight: 'bold',
  },
  accountId: {
    fontSize: 10, // Decreased font size for account ID
    fontStyle: 'italic',
    color: '#777',
    marginTop: 4,
  },
  time: {
    fontSize: 10, // Decreased font size for timestamp
    fontStyle: 'italic',
    color: '#777',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payment: {
    fontSize: 24, // Adjusted size for visibility
    color: 'blue',
    marginRight: 10,
  },
  iconContainer: {
    flexDirection: 'column', // Changed to column for vertical alignment
    alignItems: 'center',

  },
});

export default Exchange;
