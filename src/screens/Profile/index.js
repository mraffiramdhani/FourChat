import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import firebase from 'react-native-firebase';
import { StyleSheet, View, Text, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import { db, setData, users } from '../../config/initialize';

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

const Profile = (props) => {

  const [uid, setUID] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const user = users().currentUser;
    if(user){
      await db().ref('users/' + user.uid).on('value', async snapshot => {
        setLoading(false);
        setUID(snapshot.val().uid);
        setEmail(snapshot.val().email);
        setName(snapshot.val().name);
        const avatarURI = firebase.storage().ref('/' + snapshot.val().photo);
        await avatarURI.getDownloadURL().then(file => {
          if(file !== '' && file !== null && file !== undefined){
            setPhoto({ uri: file });
          }
          else{
            setPhoto(require('../../assets/images/default.png'));
          }
        });
      });
    }
    else{
      await props.navigation.replace('Login');
    }
  }

  const signOutUser = async () => {
    setLoading(true);
    users().signOut().then(async (result) => {
      setLoading(false);
      setUID(null);
      setEmail(null);
      await props.navigation.navigate('Login');
    }).catch((error) => {
      Alert.alert('Logout Failed', error.message);
    });
  };

  const truncate = (source, size) => {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerWrapper}>
          <View style={styles.imageWrapper}>
            <Avatar
              rounded
              size={120}
              source={photo}
              onEditPress={() => console.log('avatar clicked')}
              showEditButton
            />
          </View>
          <View style={styles.nameWrapper}>
            <Text style={styles.name}>{truncate(name, 15)}</Text>
            <Text style={styles.email}>{truncate(email, 20)}</Text>
          </View>
        </View>
        <View style={styles.bodyWrapper}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ListItem
              onPress={signOutUser}
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
};

export default Profile;
