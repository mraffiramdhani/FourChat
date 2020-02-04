import React, { Component } from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import normalize from 'react-native-normalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { StyleSheet, Text, View } from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { db } from '../../config/initialize';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerWrapper: {
    flexDirection: 'row',
    height: normalize(50, 'height'),
    width: '100%',
    backgroundColor: '#117C6F',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  },
})

class Chat extends Component {

  constructor(props) {
    super(props)
    this._isMounted = false;
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
    this._isMounted = true;
    const uid = this.props.user.data.uid;
    const uname = this.props.user.data.name;
    const uavatar = this.props.user.photo;
    const person = this.props.navigation.getParam('person');
    await this.setState({ uid, uname, uavatar, person });
    console.log(this.state.person);
    let msgData = null;
    if (this._isMounted) {
      msgData = db().ref('messages').child(this.state.uid).child(this.state.person.uid).limitToLast(30);

      msgData.on('child_added', async snapshot => {
        this.setState(prevState => ({
          messageList: GiftedChat.append(prevState.messageList, snapshot.val()),
        }));
      });
    }
    else {
      db().ref('messages').child(this.state.uid).child(this.state.person.uid).off("child_added");
    }
  }

  componentWillUnmount() {
    db().ref('messages').child(this.state.uid).child(this.state.person.uid).off("child_added");
    this._isMounted = false;
  }

  onSend = async () => {
    if (this.state.message.length > 0) {
      let msgId = firebase
        .database()
        .ref('messages')
        .child(this.state.uid)
        .child(this.state.person.uid)
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
        '/' +
        this.state.person.uid +
        '/' +
        msgId
      ] = message;
      updates[
        'messages/' +
        this.state.person.uid +
        '/' +
        this.state.uid +
        '/' +
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
            backgroundColor: '#ddd',
          },
        }}
      />
    );
  };

  renderSend(props) {
    return (
      <Send {...props}>
        <Icon name="send-circle" style={{ color: '#117C6F' }} size={45} />
      </Send>
    );
  };

  truncate = (source, size) => {
    if (source !== null && source !== undefined && source !== '') {
      return source.length > size ? source.slice(0, size - 1) + "…" : source;
    }
    else {
      return 'Loading…'
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerWrapper}>
            <Icon name="keyboard-backspace" style={{ color: 'white', marginHorizontal: 10 }} size={30} onPress={() => this.props.navigation.goBack()} />
            <Text style={styles.title}>{this.truncate(this.state.person.name, 25)}</Text>
          </View>
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

const mapStateToProps = state => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Chat);