/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable global-require */
import React, { useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Image } from 'react-native';

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
    width: normalize(200),
    height: normalize(200, 'height'),
  },
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
      </View>
    </SafeAreaView>
  );
};

export default Splash;
