import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#117C6F',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    elevation: 5,
    padding: 20,
  },
});

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <Text style={styles.title}>Log In</Text>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label='Email'
              keyboardType="email-address"
              mode="outlined"
              placeholder="Type a valid email."
              underlineColor="green"
              selectionColor="green"
              theme={{ colors: { primary: '#117C6F' } }}
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </Card.Content>
          <Card.Actions>
            {/* <Button>Cancel</Button>
            <Button>Ok</Button> */}
          </Card.Actions>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default Login;
