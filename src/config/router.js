/* eslint-disable react/prop-types */
import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Splash from '../screens/Splash';
import UserAuth from '../screens/UserAuth';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ChatList from '../screens/ChatList';
import Profile from '../screens/Profile';
import DetailUser from '../screens/Profile/DetailUser';
import NearMe from '../screens/NearMe';
import Chat from '../screens/Chat';

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

const ChatStack = createStackNavigator(
  {
    ChatList: {
      screen: ChatList,
      navigationOptions: {
        headerShown: false,
      },
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'ChatList',
  }
);

ChatStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  }
}


const MapStack = createStackNavigator(
  {
    NearMe: {
      screen: NearMe,
      navigationOptions: {
        headerShown: false,
      },
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'NearMe',
  }
);

MapStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  }
}


const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: {
        headerShown: false,
      },
    },
    DetailUser: {
      screen: DetailUser,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Profile',
  }
);

ProfileStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  }
}


const BottomNav = createBottomTabNavigator(
  {
    Chat: {
      screen: ChatStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => {
          return <Icon name="ios-chatbubbles" size={25} color={tintColor} />;
        },
      },
    },
    NearMe: {
      screen: MapStack,
      navigationOptions: {
        title: 'Near Me',
        tabBarIcon: ({ tintColor }) => {
          return <Icon name="md-map" size={25} color={tintColor} />;
        },
      }
    },
    Profile: {
      screen: ProfileStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => {
          return <Icon name="md-person" size={25} color={tintColor} />;
        },
      }
    }
  },
  {
    initialRouteName: 'Chat',
    tabBarOptions: {
      activeTintColor: '#FFFFFF',
      activeBackgroundColor: '#117C6F',
      inactiveTintColor: '#117C6F',
      inactiveBackgroundColor: '#FFFFFF',
      style: {
        backgroundColor: 'white',
        borderColor: 'transparent',
      },
    },
  },
);

const SwitchNav = createSwitchNavigator(
  {
    Splash,
    UserAuth,
    AuthStack,
    BottomNav,
  },
  {
    initialRouteName: 'Splash',
  }
);

const AppContainer = createAppContainer(SwitchNav);

const Router = () => <AppContainer />;

export default Router;
