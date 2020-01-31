/* eslint-disable react/prop-types */
/* eslint-disable global-require */
import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import { StyleSheet, View, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import normalize from 'react-native-normalize';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prologWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20,
    width: '100%',
  },
  prolog: {
    color: '#117C6F',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
  },
  button: {
    marginVertical: 2,
  },
  image: {
    width: normalize(250),
    height: normalize(180, 'height'),
  },
});

const buttonTheme = {
  colors: { primary: '#117C6F' },
};

const UserAuth = props => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.imageWrapper}>
          <Image source={require('../../assets/images/user_auth.png')} style={styles.image} />
        </View>
        <View style={styles.prologWrapper}>
          <Text style={styles.prolog}>Connect with people on 4Chat</Text>
          <View>
            <View style={styles.button}>
              <Button
                onPress={() => props.navigation.navigate('Login')}
                mode="contained"
                theme={buttonTheme}
                uppercase
              >
                login
              </Button>
            </View>
            <View style={styles.button}>
              <Button
                onPress={() => props.navigation.navigate('Register')}
                mode="outlined"
                theme={buttonTheme}
                uppercase
              >
                register
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserAuth;
