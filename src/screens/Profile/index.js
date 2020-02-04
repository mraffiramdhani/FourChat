import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text, ScrollView, PermissionsAndroid, ToastAndroid, Modal, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { Avatar, ListItem } from 'react-native-elements';
import { db, users } from '../../config/initialize';
import { withNavigation } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    flexDirection: 'row',
    height: normalize(200, 'height'),
    width: '100%',
    backgroundColor: '#117C6F',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  imageWrapper: {
    paddingHorizontal: 20,
  },
  nameWrapper: {
    flex: 1,
    paddingRight: 20,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  },
  email: {
    fontSize: 14,
    fontFamily: 'Nunito-Light',
    color: 'white',
  }
});

class Profiles extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: null,
      permissionsGranted: null,
      errorMessage: null,
      loading: false,
      updatesEnabled: false,
      location: {},
      photo: null,
      imageUri: null,
      imgSource: '',
      uploading: false,
      name: '',
      email: '',
    }
  }

  async componentDidMount() {
    const userId = await AsyncStorage.getItem('userid');
    const name = await AsyncStorage.getItem('user.name');
    const email = await AsyncStorage.getItem('user.email');
    const photo = await AsyncStorage.getItem('user.photo');
    this.setState({ userId, email, name, photo });
  }

  async signOutUser(props) {
    this.setState({ loading: true });
    await AsyncStorage.getItem('userid').then(async userId => {
      db().ref('users/' + userId).update({ status: 'Offline' });
      await AsyncStorage.clear();
      users().signOut();
      ToastAndroid.show('Logout Success', ToastAndroid.LONG);
      this.setState({ loading: false });
      props.navigation.navigate('Login');
    })
  }

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    catch (error) {
      console.warn(err);
      return false;
    }
  }

  updateProfilePic = async () => {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;

    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
    };

    let cameraPermission =
      (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    if (!cameraPermission) {
      cameraPermission = await this.requestCameraPermission();
    } else {
      ImagePicker.showImagePicker(options, response => {
        if (response.didCancel) {
          ToastAndroid.show('You cancelled image picker', ToastAndroid.LONG);
        } else if (response.error) {
          ToastAndroid.show(response.error, ToastAndroid.LONG);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          ToastAndroid.show('loading...', ToastAndroid.LONG);
          const imageRef = firebase
            .storage()
            .ref('avatar/' + this.state.userId)
            .child('photo');
          imageRef
            .putFile(response.path)
            .then(data => {
              ToastAndroid.show('Upload success', ToastAndroid.LONG);
              firebase
                .database()
                .ref('users/' + this.state.userId)
                .update({ photo: data.downloadURL });
              this.setState({ photo: data.downloadURL });
              AsyncStorage.setItem('user.photo', this.state.photo);
            }).catch(err => console.log(err));
        }
      });
    }
  };

  truncate = (source, size) => {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea} >
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.loading}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        </Modal>
        <View style={styles.root}>
          <View style={styles.headerWrapper}>
            <View style={styles.imageWrapper}>
              <Avatar
                rounded
                size={120}
                source={{ uri: this.state.photo }}
                onEditPress={() => this.updateProfilePic()}
                showEditButton
              />
            </View>
            <View style={styles.nameWrapper}>
              <Text style={styles.name}>{this.truncate(this.state.name, 15)}</Text>
              <Text style={styles.email}>{this.truncate(this.state.email, 20)}</Text>
              <Button
                mode="contained"
                style={{ marginVertical: 5 }}
                theme={{ colors: { primary: 'white' } }}
                uppercase
                onPress={() => this.props.navigation.navigate('DetailUser')}
              >
                edit profile
              </Button>
            </View>
          </View>
          <View style={styles.bodyWrapper}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ListItem
                onPress={() => this.signOutUser(this.props)}
                title="Logout"
                containerStyle={{ borderBottomWidth: 0 }}
                bottomDivider
                topDivider
              />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }
};

const Profile = withNavigation(Profiles);

export default Profile;
