import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text, ScrollView, Alert, Modal, ActivityIndicator, ToastAndroid } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import { db, setData, users, avatar } from '../../config/initialize';
import { withNavigation } from 'react-navigation';

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
    const name = await AsyncStorage.getItem('user.name');
    const email = await AsyncStorage.getItem('user.email');
    const photo = await AsyncStorage.getItem('user.photo');
    this.setState({ email, name, photo });
  }

  async signOutUser(props) {
    await AsyncStorage.getItem('userid').then(async userId => {
      db().ref('users/' + userId).update({ status: 'Offline' });
      await AsyncStorage.clear();
      users().signOut();
      ToastAndroid.show('Logout Success', ToastAndroid.LONG);
      props.navigation.navigate('Login');
    })
  }

  truncate = (source, size) => {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea} >
        <View style={styles.root}>
          <View style={styles.headerWrapper}>
            <View style={styles.imageWrapper}>
              <Avatar
                rounded
                size={120}
                source={{ uri: this.state.photo }}
                onEditPress={() => console.log('avatar clicked')}
                showEditButton
              />
            </View>
            <View style={styles.nameWrapper}>
              <Text style={styles.name}>{this.truncate(this.state.name, 15)}</Text>
              <Text style={styles.email}>{this.truncate(this.state.email, 20)}</Text>
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
