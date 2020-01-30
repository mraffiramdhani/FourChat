/* eslint-disable global-require */
import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import { StyleSheet, View, Image } from 'react-native';
import { Card } from 'react-native-paper';
import normalize from 'react-native-normalize';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#117C6F',
    padding: 20,
  },
  content: {
    padding: 20,
  },
  image: {
    width: normalize(250),
    height: normalize(180, 'height'),
  },
});

const UserAuth = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <Card>
          <Card.Content>
            <View style={styles.content}>
              <Image
                source={require('../../assets/images/user_auth.png')}
                style={styles.image}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default UserAuth;
