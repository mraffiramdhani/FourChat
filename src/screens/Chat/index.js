import React, { Component } from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, View } from 'react-native'

export default class Chat extends Component {

  componentDidMount() {
    const name = AsyncStorage.getItem('user.name');
    console.warn(name);
  }

  render() {
    return (
      <View>
        <Text> Chat </Text>
      </View>
    )
  }
}
