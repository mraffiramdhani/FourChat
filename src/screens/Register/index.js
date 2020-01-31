import React, {useState, useEffect} from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

const styles = StyleSheet.create({
	safeArea: {flex: 1},
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

const Register = (props) => {

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [visiblePassword, setVisiblePassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
	      <View style={styles.titleWrapper}>
		      <Text style={styles.title}>Register</Text>
		    </View>
		    <ScrollView showsVerticalScrollIndicator={false}>
	      	<Image source={require('../../assets/images/register.png')} style={styles.image} />
		      <View style={styles.formWrapper}>
		      	<TextInput
		      		label="Full Name"
		      		mode="outlined"
		      		theme={inputTheme}
		      		value={name}
		      		style={styles.input}
		      		onChangeText={name => setName(name)}
		      	/>
		      	<TextInput
		      		label="E-mail"
		      		mode="outlined"
		      		theme={inputTheme}
		      		value={email}
		      		style={styles.input}
		      		keyboardType="email-address"
		      		onChangeText={email => setEmail(email)}
		      	/>
		      	<View style={{flex: 1, flexDirection: 'row'}}>
			      	<TextInput
			      		label="Password"
			      		mode="outlined"
			      		theme={inputTheme}
			      		value={password}
			      		secureTextEntry={!visiblePassword}
			      		style={[styles.input, {flex: 1}]}
			      		onChangeText={pass => setPassword(pass)}
			      	/>
			      	<Button
			      		icon="lock"
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
		      	>
		      	register
		      	</Button>
		      	<Button
			      	style={styles.button}
			      	theme={inputTheme}
			      	uppercase
			      	mode="outlined"
			      	onPress={() => props.navigation.navigate('Login')}
			      >
			      i have an account
			      </Button>
		     </View>
		    </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Register;
