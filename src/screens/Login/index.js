import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import firebase from 'react-native-firebase';
import { StyleSheet, View, ScrollView, Image, Modal, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { login } from '../../config/initialize';

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

const emptyTheme = {
  colors: {
    primary: 'red',
  },
};

const Login = (props) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  
  const [isEmailEmpty, setEmailEmpty] = useState(true);
  const [isPasswordEmpty, setPasswordEmpty] = useState(true);
  const [isSubmit, setSubmit] = useState(false);

  useEffect(() => {
    if(isSubmit){
      handleLogin();
    }
  }, [isSubmit]);

  const onSubmit = () => {
    setVisibleModal(true);
    setSubmit(true);
  };

  const handleLogin = async () => {
    if(!isEmailEmpty && !isPasswordEmpty){
      await login(email, password)
      .then(() => onSuccess())
      .catch(error => onFailed(error.message));
    }
    else {
      Alert.alert('Login Message', 'Please Provide a Valid Data.');
    }
  };

  const onChangeEmail = (e) => {
    setEmail(e);
    if(e.length === 0){
      setEmailEmpty(true);
    }
    else {
      setEmailEmpty(false);
    }
  }

  const onChangePassword = (e) => {
    setPassword(e);
    if (e.length === 0) {
      setPasswordEmpty(true);
    }
    else {
      setPasswordEmpty(false);
    }
  }

  const onSuccess = () => {
    props.navigation.navigate('ChatList');
  };

  const onFailed = err => {
    Alert.alert('Login Failed', err);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visibleModal}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)'}} >
          <ActivityIndicator animating={true} size="xlarge" color="#117C6F" />
        </View>
      </Modal>
      <View style={styles.root}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Login</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={require('../../assets/images/login.png')} style={styles.image} />
          <View style={styles.formWrapper}>
            <TextInput
              label="E-mail"
              mode="outlined"
              theme={isEmailEmpty ? emptyTheme : inputTheme}
              value={email}
              style={styles.input}
              keyboardType="email-address"
              onChangeText={email => onChangeEmail(email)}
            />
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <TextInput
                label="Password"
                mode="outlined"
                theme={isPasswordEmpty ? emptyTheme : inputTheme}
                value={password}
                secureTextEntry={!visiblePassword}
                style={[styles.input, { flex: 1 }]}
                onChangeText={pass => onChangePassword(pass)}
              />
              <Button
                icon={!visiblePassword ? "eye" : "eye-off"}
                theme={inputTheme}
                style={styles.passwordVisibility}
                compact
                onPress={() => setVisiblePassword(!visiblePassword)}
              />
            </View>
            <Button
              style={styles.button}
              theme={inputTheme}
              uppercase
              mode="contained"
              onPress={onSubmit}
              disabled={(isEmailEmpty || isPasswordEmpty) ? true : false}
            >
              login
            </Button>
            <Button
              style={styles.button}
              theme={inputTheme}
              uppercase
              mode="outlined"
              onPress={() => props.navigation.replace('Register')}
            >
              register
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Login;
