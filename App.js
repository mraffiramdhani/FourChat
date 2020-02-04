import React, { Component } from 'react';
import firebase from 'react-native-firebase';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import storage from './src/redux/store';
import Router from './src/config/router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

const { store, persistor } = storage();

class App extends Component {

  componentDidMount() {
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
        } else {
          firebase.messaging().requestPermission()
            .then(() => {
              // User has authorised  
            })
            .catch(error => {
              // User has rejected permissions  
            });
        }
      });
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar backgroundColor="#117C6F" barStyle="light-content" />
            <Router />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    );
  }
};

export default App;
