import React, { Component } from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import Geolocation from 'react-native-geolocation-service';
import { StyleSheet, View, Text, Image, ScrollView, Platform, PermissionsAndroid, ToastAndroid } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { signup, db } from '../../config/initialize';

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

class Register extends Component {

	constructor(props) {
		super(props)
		this.state = {
			name: '',
			email: '',
			password: '',
			visiblePassword: false,
			latitude: null,
			longitude: null,
			errorMessage: null,
			loading: false,
			updatesEnabled: false,
		}
	}

	async componentDidMount() {
		await this.getLocation();
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
					console.warn(position);
				},
				error => {
					this.setState({ errorMessage: error, loading: false });
					console.warn(error);
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

	inputHandler = (name, value) => {
		this.setState(() => ({ [name]: value }));
	};

	submitForm = () => {
		const { email, name, password } = this.state;
		if (name.length < 1) {
			ToastAndroid.show('Please input your fullname', ToastAndroid.LONG);
		} else if (email.length < 6) {
			ToastAndroid.show(
				'Please input a valid email address',
				ToastAndroid.LONG,
			);
		} else if (password.length < 6) {
			ToastAndroid.show(
				'Password must be at least 6 characters',
				ToastAndroid.LONG,
			);
		} else {
			signup(email, password)
				.then(response => {
					console.warn(response);
					db().ref('users/' + response.user.uid)
						.set({
							name: this.state.name,
							status: 'Offline',
							email: this.state.email,
							photo: 'avatar/default.png',
							latitude: this.state.latitude,
							longitude: this.state.longitude,
							uid: response.user.uid,
						})
						.catch(error => {
							ToastAndroid.show(error.message, ToastAndroid.LONG);
							this.setState({
								name: '',
								email: '',
								password: '',
							});
						});
					ToastAndroid.show(
						'Your account is successfully registered!',
						ToastAndroid.LONG,
					);

					this.props.navigation.navigate('ChatList');
				})
				.catch(error => {
					this.setState({
						errorMessage: error.message,
						name: '',
						email: '',
						password: '',
					});
					ToastAndroid.show(this.state.errorMessage.message, ToastAndroid.LONG);
				});
		}
	};

	render() {
		return (
			<SafeAreaView style={styles.safeArea} >
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
								value={this.state.name}
								style={styles.input}
								maxLength={25}
								onChangeText={txt => this.inputHandler('name', txt)}
							/>
							<Text style={{ fontSize: 14, color: '#666', textAlign: 'right' }}>{25 - this.state.name.length}</Text>
							<TextInput
								label="E-mail"
								mode="outlined"
								theme={inputTheme}
								value={this.state.email}
								style={styles.input}
								keyboardType="email-address"
								onChangeText={txt => this.inputHandler('email', txt)}
							/>
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<TextInput
									label="Password"
									mode="outlined"
									theme={inputTheme}
									value={this.state.password}
									secureTextEntry={!this.state.visiblePassword}
									style={[styles.input, { flex: 1 }]}
									onChangeText={txt => this.inputHandler('password', txt)}
								/>
								<Button
									icon={!this.state.visiblePassword ? "eye" : "eye-off"}
									theme={inputTheme}
									style={styles.passwordVisibility}
									compact
									onPress={() => this.setState({ visiblePassword: !this.state.visiblePassword })}
								/>
							</View>
							<Button
								style={styles.button}
								theme={inputTheme}
								uppercase
								mode="contained"
								onPress={this.submitForm}
							>
								register
		      	</Button>
							<Button
								style={styles.button}
								theme={inputTheme}
								uppercase
								mode="outlined"
								onPress={() => this.props.navigation.replace('Login')}
							>
								i have an account
			      </Button>
						</View>
					</ScrollView>
				</View>
			</SafeAreaView>
		);
	}
};

export default Register;
