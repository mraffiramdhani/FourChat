import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text, ToastAndroid, Modal, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import Input from '../../components/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { users, db } from '../../config/initialize';
import { connect } from 'react-redux';
import { setUser } from '../../redux/action/user';

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
    height: normalize(50, 'height'),
    width: '100%',
    backgroundColor: '#117C6F',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    padding: 20,
  },
  back: {
    paddingHorizontal: 15
  },
  saveButton: {
    marginTop: 20,
  }
});

const inputTheme = {
  colors: {
    primary: '#117C6F'
  }
}

class DetailUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      password: '',
      loading: false,
      visiblePassword: false,
      isNameValid: true,
      isEmailValid: true,
      isPasswordValid: null,
    }
  }

  async componentDidMount() {
    await this.getUser();
  }

  async getUser() {
    this.setState({ loading: true });
    const uid = await AsyncStorage.getItem('userid');
    await db().ref('users/' + uid).once('value', async snapshot => {
      this.setState({
        name: snapshot.val().name,
        email: snapshot.val().email,
      });
    });
    this.setState({ loading: false });
  }

  async updateProfile() {
    const { name, email, password, isNameValid, isEmailValid, isPasswordValid } = this.state;
    if (!isNameValid) {
      ToastAndroid.show(
        'Please input your fullname',
        ToastAndroid.LONG
      );
    }
    else if (!isEmailValid) {
      ToastAndroid.show(
        'Please input a valid email format',
        ToastAndroid.LONG
      );
    }
    else {
      await this.setState({ loading: true });
      const uid = this.props.user.data.uid;
      db().ref('users/' + uid).update({
        name: name,
        email: email,
      })
      await users().currentUser.updateEmail(email);
      if (password.length > 0 && !isPasswordValid.find(stat => stat === false) !== undefined) {
        await users().currentUser.updatePassword(password);
      }
      await db().ref('users/' + uid).once('value', async snapshot => {
        this.props.setUser(snapshot.val());
      });
      ToastAndroid.show('Changes Saved', ToastAndroid.LONG);
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.loading}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        </Modal>
        <View style={styles.root}>
          <View style={styles.headerWrapper}>
            <Icon
              name="ios-arrow-dropleft"
              color="white"
              size={30}
              style={styles.back}
              onPress={() => this.props.navigation.goBack()}
            />
            <Text style={styles.title}>User Profile</Text>
          </View>
          <View style={styles.bodyWrapper}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'right' }}>{25 - this.state.name.length}</Text>
            <Input
              label="Full Name"
              mode="outlined"
              pattern="^[a-zA-Z ]+$"
              theme={inputTheme}
              value={this.state.name}
              onChangeText={text => this.setState({ name: text })}
              maxLength={25}
              onValidation={isValid => this.setState({ isNameValid: isValid })}
            />
            {
              this.state.isNameValid !== null && !this.state.isNameValid &&
              <Text style={{ color: 'red', marginVertical: 2 }}>
                must not contain any special characters.
          			</Text>
            }
            <Input
              label="E-mail"
              mode="outlined"
              pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$"
              theme={inputTheme}
              value={this.state.email}
              keyboardType="email-address"
              onChangeText={text => this.setState({ email: text })}
              onValidation={isValid => this.setState({ isEmailValid: isValid })}
            />
            {
              this.state.isEmailValid !== null && !this.state.isEmailValid &&
              <Text style={{ color: 'red', marginVertical: 2 }}>
                must be a valid email format
          			</Text>
            }
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Input
                label="Password"
                mode="outlined"
                theme={inputTheme}
                value={this.state.password}
                pattern={[
                  "(?=.*[a-z])",
                  "(?=.*[A-Z])",
                  "^.{6,20}$"
                ]}
                secureTextEntry={!this.state.visiblePassword}
                style={{ flex: 1 }}
                onChangeText={txt => this.setState({ password: txt })}
                onValidation={isValid => this.setState({ isPasswordValid: isValid })}
              />
              <Button
                icon={!this.state.visiblePassword ? "eye" : "eye-off"}
                theme={inputTheme}
                style={{ marginHorizontal: 10 }}
                compact
                onPress={() => this.setState({ visiblePassword: !this.state.visiblePassword })}
              />
            </View>
            <View style={{ flex: 0, flexDirection: 'column', marginVertical: 2 }}>
              {
                this.state.isPasswordValid !== null && !this.state.isPasswordValid[0] &&
                <Text style={{ color: 'red' }}>
                  must be contain at least one lowercase letter.
          				</Text>
              }
              {
                this.state.isPasswordValid !== null && !this.state.isPasswordValid[1] &&
                <Text style={{ color: 'red' }}>
                  must be contain at least one uppercase letter.
          				</Text>
              }
              {
                this.state.isPasswordValid !== null && !this.state.isPasswordValid[2] &&
                <Text style={{ color: 'red' }}>
                  must be between 6 to 20 characters.
          				</Text>
              }
            </View>
            <Button
              theme={inputTheme}
              mode="contained"
              style={styles.saveButton}
              uppercase
              onPress={() => this.updateProfile()}
            >
              save changes
            </Button>
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

const mapDispatchToProps = dispatch => {
  return {
    setUser: data => dispatch(setUser(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailUser);
