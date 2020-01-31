/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable global-require */
import React, { useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Image, Text } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: {
    backgroundColor: '#117C6F',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: normalize(150),
    height: normalize(150, 'height'),
  },
  title: {
    color: 'white',
    fontFamily: 'Nunito-Bold',
    fontSize: 40,
    marginTop: 10,
  }
});

const Splash = props => {
  useEffect(() => {
    setTimeout(() => {
      props.navigation.navigate('UserAuth');
    }, 3000);
  }, [props.navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <Image source={require('../../assets/images/4chat.png')} style={styles.icon} />
        <Text style={styles.title}>4Chat</Text>
      </View>
    </SafeAreaView>
  );
};

export default Splash;
