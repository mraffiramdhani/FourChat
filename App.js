import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import Router from './src/config/router';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#117C6F" barStyle="light-content" />
      <Router />
    </SafeAreaProvider>
  );
};

export default App;
