import React from 'react';
import Router from './src/config/router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#117C6F" barStyle="light-content" />
      <Router />
    </SafeAreaProvider>
  );
};

export default App;
