import React from 'react';
import { StyleSheet, View } from 'react-native';
import AddPostUser from './addPostUser';
import DEMO from './h';
import MultiImagePickerWithLocation from './h';
import AddPostTour from './addPostTour';

const Layout = () => {
    return (
        <View style={{flex: 1}}>
          <AddPostUser />
          {/* <AddPostTour/> */}
        </View>
    );
}

const styles = StyleSheet.create({})

export default Layout;
