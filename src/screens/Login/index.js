import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-community/async-storage';
import Input from '../../components/Input';
import Geolocation from 'react-native-geolocation-service';
import { login, db } from '../../config/initialize';
import { StyleSheet, View, ScrollView, Image, Platform, PermissionsAndroid, ToastAndroid, Modal, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { connect } from 'react-redux';
import { setUser, setPhoto } from '../../redux/action/user';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    width: '100%',
    padding: 20,
  },
  title: {
    color: '#117C6F',
    fontSize: 28,
    fontFamily: 'Nunito-Regular',
  },
  image: {
    width: normalize(320),
    height: normalize(200, 'height'),
  },
  formWrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginVertical: 20,
  },
  passwordVisibility: {
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(70),
  },
  button: {
    marginVertical: 5,
  },
  input: {
    backgroundColor: 'white',
  }
});

const inputTheme = {
  colors: {
    primary: '#117C6F',
  },
};

class Login extends Component {

  constructor(props) {
    super(props)
    this._isMounted = false;
    this.state = {
      email: '',
      password: '',
      visiblePassword: false,
      loading: false,
      isEmailValid: null,
      isPasswordValid: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.getLocation();
  }

  componentWillUnmount() {
    this._isMounted = false;
    Geolocation.clearWatch();
    Geolocation.stopObserving();
  }

  hasLocationPermission = async () => {
    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location Permission Denied By User.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location Permission Revoked By User.',
        ToastAndroid.LONG,
      );
    }
    return false;
  };

  getLocation = async () => {
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) {
      return;
    }

    this.setState({ loading: true }, () => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
        },
        error => {
          this.setState({ errorMessage: error });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 8000,
          distanceFilter: 50,
          forceRequestLocation: true,
        },
      );
    });
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    if (!this.state.isEmailValid) {
      ToastAndroid.show(
        'Please input a valid email address',
        ToastAndroid.LONG,
      );
    } else if (this.state.isPasswordValid.find(stat => stat === false) !== undefined) {
      ToastAndroid.show(
        'Please input a valid password',
        ToastAndroid.LONG,
      );
    } else {
      this.setState({ loading: true });
      db().ref('users/')
        .orderByChild('/email')
        .equalTo(email)
        .once('value', result => {
          let data = result.val();
          if (data !== null) {
            let user = Object.values(data);

            this.props.setUser(user[0]);
            this.props.setPhoto(user[0].photo);
            // experimental purposes
            AsyncStorage.setItem('user.email', user[0].email);
            AsyncStorage.setItem('user.name', user[0].name);
            AsyncStorage.setItem('user.photo', user[0].photo);
          }
        });
      login(email, password)
        .then(async response => {
          db().ref('users/' + response.user.uid).update({
            status: 'Online',
            latitude: this.state.latitude || null,
            longitude: this.state.longitude || null,
          });
          // AsyncStorage.setItem('user', response.user);
          await AsyncStorage.setItem('userid', response.user.uid);
          // await AsyncStorage.setItem('user', response.user);
          ToastAndroid.show('Login success', ToastAndroid.LONG);
          this.setState({ loading: false });
          await this.props.navigation.navigate('ChatList');
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            email: '',
            password: '',
          });
          ToastAndroid.show(this.state.errorMessage, ToastAndroid.LONG);
        });
    }
  };

  _toastWithDurationGravityOffsetHandler = () => {
    //function to make Toast With Duration, Gravity And Offset
    ToastAndroid.showWithGravityAndOffset(
      `Hi, Welcome '${this.state.user.name}'`,
      ToastAndroid.LONG, //can be SHORT, LONG
      ToastAndroid.BOTTOM, //can be TOP, BOTTON, CENTER
      25, //xOffset
      50, //yOffset
    );
  };

  handleChange = key => val => {
    this.setState({ [key]: val });
  };

  render() {
    return (
      <SafeAreaView style={styles.safeArea} >
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
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Login</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={require('../../assets/images/login.png')} style={styles.image} />
            <View style={styles.formWrapper}>
              <Input
                label="E-mail"
                mode="outlined"
                theme={inputTheme}
                value={this.state.email}
                style={styles.input}
                pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$"
                keyboardType="email-address"
                onChangeText={this.handleChange('email')}
                onValidation={isValid => this.setState({ isEmailValid: isValid })}
              />
              {
                this.state.isEmailValid !== null && !this.state.isEmailValid &&
                <Text style={{ color: 'red', marginVertical: 2 }}>
                  must be a valid email format
          			</Text>
              }
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Input
                  label="Password"
                  mode="outlined"
                  theme={inputTheme}
                  value={this.state.password}
                  secureTextEntry={!this.state.visiblePassword}
                  pattern={[
                    "(?=.*[a-z])",
                    "(?=.*[A-Z])",
                    "^.{6,20}$"
                  ]}
                  style={[styles.input, { flex: 1 }]}
                  onChangeText={this.handleChange('password')}
                  onValidation={isValid => this.setState({ isPasswordValid: isValid })}
                />
                <Button
                  icon={!this.state.visiblePassword ? "eye" : "eye-off"}
                  theme={inputTheme}
                  style={styles.passwordVisibility}
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
                style={styles.button}
                theme={inputTheme}
                uppercase
                mode="contained"
                onPress={this.handleLogin}
              >
                login
            </Button>
              <Button
                style={styles.button}
                theme={inputTheme}
                uppercase
                mode="outlined"
                onPress={() => this.props.navigation.replace('Register')}
              >
                register
            </Button>
            </View>
          </ScrollView>
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
    setUser: data => dispatch(setUser(data)),
    setPhoto: photo => dispatch(setPhoto(photo))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
