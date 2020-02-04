import React, { Component } from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import Input from '../../components/Input';
import { signup, db, avatar } from '../../config/initialize';
import { StyleSheet, View, Text, Image, ScrollView, Platform, PermissionsAndroid, ToastAndroid, Modal, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { connect } from 'react-redux';
import { setUser, setPhoto } from '../../redux/action/user';

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

class Register extends Component {

	constructor(props) {
		super(props)
		this.state = {
			name: '',
			email: '',
			password: '',
			photo: '',
			visiblePassword: false,
			latitude: null,
			longitude: null,
			errorMessage: null,
			loading: false,
			updatesEnabled: false,
			isNameValid: null,
			isEmailValid: null,
			isPasswordValid: null,
		}
	}

	async componentDidMount() {
		await this.getLocation();
		await this.getDefaultAvatar();
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
				async position => {
					await this.setState({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						loading: false,
					});
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

	getDefaultAvatar = async () => {
		await avatar('avatar/default.png').getDownloadURL().then(file => {
			this.setState({ photo: file });
		})
	}

	inputHandler = (name, value) => {
		this.setState(() => ({ [name]: value }));
	};

	submitForm = () => {
		const { email, name, password } = this.state;
		if (!this.state.isNameValid) {
			ToastAndroid.show('Please input your fullname', ToastAndroid.LONG);
		} else if (!this.state.isEmailValid) {
			ToastAndroid.show(
				'Please input a valid email address',
				ToastAndroid.LONG,
			);
		} else if (this.state.isPasswordValid.find(stat => stat === false) !== undefined) {
			ToastAndroid.show(
				'Please input a valid password format',
				ToastAndroid.LONG,
			);
		} else {
			this.setState({ loading: true });
			signup(email, password)
				.then(async response => {
					db().ref('users/' + response.user.uid)
						.set({
							name: this.state.name,
							status: 'Online',
							email: this.state.email,
							photo: this.state.photo,
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
					db().ref('messages/' + response.user.uid)
						.set({
							is_registered: true,
						})
						.catch(error => {
							ToastAndroid.show(error.message, ToastAndroid.LONG);
							this.setState({
								name: '',
								email: '',
								password: '',
							});
						});
					await db().ref('users/' + response.user.uid).once('value', async snapshot => {
						this.props.setUser(snapshot.val());
						this.props.setPhoto(snapshot.val().photo);
					});
					AsyncStorage.setItem('user.email', this.state.email);
					AsyncStorage.setItem('user.name', this.state.name);
					AsyncStorage.setItem('user.photo', this.state.photo);
					ToastAndroid.show(
						'Your account is successfully registered!',
						ToastAndroid.LONG,
					);

					// AsyncStorage.setItem('user', response.user);
					await AsyncStorage.setItem('userid', response.user.uid);
					await this.setState({ loading: false });
					await this.props.navigation.navigate('ChatList');
				})
				.catch(async error => {
					await this.setState({ loading: false });
					this.setState({
						errorMessage: error.message,
						name: '',
						email: '',
						password: '',
					});
					ToastAndroid.show(error.message, ToastAndroid.LONG);
				});
		}
	};

	render() {
		return (
			<SafeAreaView style={styles.safeArea} >
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.loading}
				>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
						<ActivityIndicator size="large" color="white" />
					</View>
				</Modal>
				<View style={styles.root}>
					<View style={styles.titleWrapper}>
						<Text style={styles.title}>Register</Text>
					</View>
					<ScrollView showsVerticalScrollIndicator={false}>
						<Image source={require('../../assets/images/register.png')} style={styles.image} />
						<View style={styles.formWrapper}>
							<Text style={{ fontSize: 14, color: '#666', textAlign: 'right' }}>{25 - this.state.name.length}</Text>
							<Input
								label="Full Name"
								mode="outlined"
								pattern="^[a-zA-Z ]+$"
								theme={inputTheme}
								value={this.state.name}
								style={styles.input}
								maxLength={25}
								onChangeText={txt => this.inputHandler('name', txt)}
								onValidation={isValid => this.setState({ isNameValid: isValid })}
							/>
							{
								this.state.isNameValid !== null && !this.state.isNameValid &&
								<Text style={{ color: 'red', marginVertical: 2 }}>
									must not contain any special characters.
          			</Text>
							}
							<Input
								label="E-mail"
								mode="outlined"
								pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$"
								theme={inputTheme}
								value={this.state.email}
								style={styles.input}
								keyboardType="email-address"
								onChangeText={txt => this.inputHandler('email', txt)}
								onValidation={isValid => this.setState({ isEmailValid: isValid })}
							/>
							{
								this.state.isEmailValid !== null && !this.state.isEmailValid &&
								<Text style={{ color: 'red', marginVertical: 2 }}>
									must be a valid email format
          			</Text>
							}
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<Input
									label="Password"
									mode="outlined"
									theme={inputTheme}
									value={this.state.password}
									pattern={[
										"(?=.*[a-z])",
										"(?=.*[A-Z])",
										"^.{6,20}$"
									]}
									secureTextEntry={!this.state.visiblePassword}
									style={[styles.input, { flex: 1 }]}
									onChangeText={txt => this.inputHandler('password', txt)}
									onValidation={isValid => this.setState({ isPasswordValid: isValid })}
								/>
								<Button
									icon={!this.state.visiblePassword ? "eye" : "eye-off"}
									theme={inputTheme}
									style={styles.passwordVisibility}
									compact
									onPress={() => this.setState({ visiblePassword: !this.state.visiblePassword })}
								/>
							</View>
							<View style={{ flex: 0, flexDirection: 'column', marginVertical: 2 }}>
								{
									this.state.isPasswordValid !== null && !this.state.isPasswordValid[0] &&
									<Text style={{ color: 'red' }}>
										must be contain at least one lowercase letter.
          				</Text>
								}
								{
									this.state.isPasswordValid !== null && !this.state.isPasswordValid[1] &&
									<Text style={{ color: 'red' }}>
										must be contain at least one uppercase letter.
          				</Text>
								}
								{
									this.state.isPasswordValid !== null && !this.state.isPasswordValid[2] &&
									<Text style={{ color: 'red' }}>
										must be between 6 to 20 characters.
          				</Text>
								}
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

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setUser: data => dispatch(setUser(data)),
		setPhoto: photo => dispatch(setPhoto(photo)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
