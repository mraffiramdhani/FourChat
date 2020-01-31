import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Splash from '../screens/Splash';
import UserAuth from '../screens/UserAuth';
import Login from '../screens/Login';
import Register from '../screens/Register';

const AuthStack = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: {
        headerShown: false,
      },
    },
    Register: {
      screen: Register,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Login',
  }
);

const SwitchNav = createSwitchNavigator(
  {
    Splash,
    UserAuth,
    AuthStack,
  },
  {
    initialRouteName: 'Splash',
  }
);

const AppContainer = createAppContainer(SwitchNav);

const Router = () => <AppContainer />;

export default Router;
