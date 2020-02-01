import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';

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
  },
  name: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  }
});

const DetailUser = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerWrapper}>
          <View style={styles.imageWrapper}>
            <Avatar
              rounded
              size={120}
              source={require('../../assets/images/4chat.png')}
              onPress={() => console.log('avatar clicked')}
              showEditButton
            />
          </View>
          <View style={styles.nameWrapper}>
            <Text style={styles.name}>Raffi Ramdhani</Text>
          </View>
        </View>
        <View style={styles.bodyWrapper}>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DetailUser;
