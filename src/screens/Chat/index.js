import React, { Component } from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import { StyleSheet, Text, View } from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { db } from '../../config/initialize';

const styles = StyleSheet.create({
  safeArea: { flex: 1 }
})

export default class Chat extends Component {

  constructor(props) {
    super(props)
    this.state = {
      message: '',
      messageList: [],
      person: {},
      uid: null,
      uname: null,
      uavatar: null,
    }
  }

  async componentDidMount() {
    const uid = await AsyncStorage.getItem('userid');
    const uname = await AsyncStorage.getItem('user.name');
    const uavatar = await AsyncStorage.getItem('user.photo');
    const person = this.props.navigation.getParam('person');
    this.setState({ uid, uname, uavatar, person });
    await db()
      .ref('messages/' + uid + '/friendList/' + person.uid)
      .on('child_added', async snapshot => {
        const valList = Object.values(snapshot.val());
        valList.map((item, index) => {
          this.setState(prevState => ({
            messageList: GiftedChat.append(prevState.messageList, item),
          }));
        })
      });
  }

  onSend = async () => {
    if (this.state.message.length > 0) {
      let msgId = firebase
        .database()
        .ref('messages')
        .child(this.state.uid)
        .child('friendList')
        .child(this.state.person.uid)
        .child('data')
        .push().key;
      let updates = {};
      let message = {
        _id: msgId,
        text: this.state.message,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        user: {
          _id: this.state.uid,
          name: this.state.uname,
          avatar: this.state.uavatar,
        },
      };
      updates[
        'messages/' +
        this.state.uid +
        '/friendList/' +
        this.state.person.uid +
        '/data/' +
        msgId
      ] = message;
      updates[
        'messages/' +
        this.state.person.uid +
        '/friendList/' +
        this.state.uid +
        '/data/' +
        msgId
      ] = message;
      firebase
        .database()
        .ref()
        .update(updates);
      this.setState({ message: '' });
    }
  };

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: 'blue',
          },
        }}
      />
    );
  };

  renderSend(props) {
    return (
      <Send {...props}>
        <Text>Send</Text>
      </Send>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1 }}>
          <Text>{this.state.person.name}</Text>
          <View style={{ flex: 1 }}>
            <GiftedChat
              renderSend={this.renderSend}
              renderBubble={this.renderBubble}
              text={this.state.message}
              onInputTextChanged={val => this.setState({ message: val })}
              messages={this.state.messageList}
              onSend={() => this.onSend()}
              user={{
                _id: this.state.uid
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  };
};
