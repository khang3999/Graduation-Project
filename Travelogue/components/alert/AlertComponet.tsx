import { appColors } from '@/constants/appColors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Dialog, Portal, Paragraph, Provider } from 'react-native-paper';

const AlertComponet = () => {
  const [visible, setVisible] = useState(true);

  const hideDialog = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title style={styles.title}>Thông báo</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.paragraph}>
              <Text style={{color: appColors.danger}}>Bạn không đủ số dư trong tài khoản để mua gói dịch vụ thấp nhất để đăng bài.</Text>
            </Paragraph>
            <Paragraph style={styles.paragraph}>
              Vui lòng <Text style={styles.text}>Nạp Tiền</Text> hoặc <Text style={styles.text}>Thoát Đăng Bài</Text> .
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={styles.actions}>
            <Button 
              mode="contained" 
              onPress={() => console.log('Chuyển đến trang nạp tiền')} 
              style={styles.buttonNapTien}
            >
              Nạp tiền
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => {
                router.replace('/(tabs)/');
                hideDialog();
              }} 
              style={styles.buttonThoat}
            >
              <Text style={{color: appColors.danger}}>Thoát</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  text: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 5, 
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 10,
  },
  actions: {
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 5,
  },
    buttonNapTien: {
        width: '48%',
        backgroundColor: appColors.primary,
    },
    buttonThoat: {
        width: '48%',
        borderColor: appColors.danger,
    },
});

export default AlertComponet;
