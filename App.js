import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Splash from './src/screens/Splash';
import UserAuth from './src/screens/UserAuth';
import Login from './src/screens/Login';

const AuthStack = createStackNavigator(
  {
    UserAuth: {
      screen: UserAuth,
      navigationOptions: {
        headerShown: false,
      }
    },
    Login: {
      screen: Login,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'UserAuth',
  }
);

const SwitchNav = createSwitchNavigator(
  {
    Splash,
    AuthStack,
  },
  {
    initialRouteName: 'Splash',
  }
);

const AppContainer = createAppContainer(SwitchNav);

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#117C6F" barStyle="light-content" />
      <AppContainer />
    </SafeAreaProvider>
  );
};

export default App;
