/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import { StyleSheet, View, Text, FlatList, Modal, Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import { FAB, TextInput, Button } from 'react-native-paper';
import { ListItem, Avatar, Card } from 'react-native-elements';

const styles = StyleSheet.create({
	safeArea: { flex: 1 },
	root: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerWrapper: {
		flexDirection: 'row',
		height: normalize(50, 'height'),
		width: '100%',
		backgroundColor: '#117C6F',
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		color: 'white',
		fontSize: 24,
		fontFamily: 'Nunito-Bold',
	},
	bodyWrapper: {
		flex: 1,
		flexDirection: 'column',
		width: '100%',
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		padding: 5,
		backgroundColor: '#117C6F',
	},
	cardWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	card: {
		width: normalize(320),
		height: normalize(200, 'height'),
	},
});

class ChatList extends Component {

	constructor(props) {
		super(props)
		this.state = {
			uid: null,
			users: [],
			visibleModal: false,
			addEmail: '',
			isLoading: true,
		}
	}

	async componentDidMount() {
		const uid = await AsyncStorage.getItem('userid');
		const dbRef = firebase.database().ref('messages/' + uid + '/');
		dbRef.on('child_added', async snapshot => {
			let keyList = Object.keys(snapshot.val());
			let valList = Object.values(snapshot.val());
			await valList.map(async (item, index) => {
				const friendKey = keyList[index];
				await firebase.database().ref('users/' + friendKey).on('value', async item => {
					let person = item.val();
					this.setState(prevState => {
						return {
							users: [...prevState.users, person],
						};
					});
				});
			});
		});
		await this.setState({ isLoading: false });
	};

	renderRow = (item) => {
		return (
			<ListItem
				onPress={() => this.props.navigation.navigate('Chat', { person: item })}
				title={`${item.name}`}
				subtitle={item.email}
				leftAvatar={{ source: { uri: item.photo } }}
				containerStyle={{ borderBottomWidth: 0 }}
				bottomDivider
				topDivider
			/>
		);
	};

	onSubmitFriend = () => {
		firebase.database()
			.ref('users')
			.once('value')
			.then(async snapshot => {
				const uid = await AsyncStorage.getItem('userid');
				const uname = await AsyncStorage.getItem('user.name');
				const uavatar = await AsyncStorage.getItem('user.photo');
				const db_users = await Object.values(snapshot.val());
				const friend = await db_users.find(item => item.email === this.state.addEmail);
				if (friend.uid !== undefined) {
					firebase.database()
						.ref(`messages/${uid}`)
						.once('value', async snapshot => {
							if ('friendList' in snapshot.val()) {
								const friendList = Object.keys(snapshot.val().friendList);
								const checkIfFriend = friendList.find(item => item === friend.uid);
								if (checkIfFriend !== undefined) {
									Alert.alert(
										'Add Friend Message',
										'You are already friend with this person.',
										[{ text: 'OK', style: 'cancel' }],
										{ cancelable: false }
									);
								} else {
									Alert.alert(
										'Add Friend Success',
										'Congratulation, Say Hi! to your new friend ?',
										[
											{
												text: 'Skip',
												style: 'cancel',
												onPress: async () => {
													firebase
														.database()
														.ref('messages')
														.child(uid)
														.child('friendList')
														.child(friend.uid)
														.set({ data: '' });
													this.setState({ email: '', visibleModal: false });
												}
											},
											{
												text: 'Send',
												onPress: async () => {
													let msgId = firebase
														.database()
														.ref('messages')
														.child(uid)
														.child('friendList')
														.child(friend.uid)
														.child('data')
														.push().key;
													let updates = {};
													let message = {
														_id: msgId,
														text: 'Hi! >_<',
														createdAt: firebase.database.ServerValue.TIMESTAMP,
														user: {
															_id: uid,
															name: uname,
															avatar: uavatar,
														},
													};
													updates[
														'messages/' +
														uid +
														'/friendList/' +
														friend.uid +
														'/data/' +
														msgId
													] = message;
													updates[
														'messages/' +
														friend.uid +
														'/friendList/' +
														uid +
														'/data/' +
														msgId
													] = message;
													firebase
														.database()
														.ref()
														.update(updates);
													this.setState({ email: '', visibleModal: false });
												},
											},
										],
										{ cancelable: false }
									);
								}
							} else {
								Alert.alert(
									'Add Friend Success',
									'Congratulation, Say Hi! to your new friend ?',
									[
										{
											text: 'Skip',
											style: 'cancel',
											onPress: async () => {
												firebase
													.database()
													.ref('messages')
													.child(uid)
													.child('friendList')
													.child(friend.uid)
													.set({ data: '' });
												this.setState({ email: '', visibleModal: false });
											}
										},
										{
											text: 'Send',
											onPress: async () => {
												let msgId = firebase
													.database()
													.ref('messages')
													.child(uid)
													.child('friendList')
													.child(friend.uid)
													.child('data')
													.push().key;
												let updates = {};
												let message = {
													_id: msgId,
													text: 'Hi! >_<',
													createdAt: firebase.database.ServerValue.TIMESTAMP,
													user: {
														_id: uid,
														name: uname,
														avatar: uavatar,
													},
												};
												updates[
													'messages/' +
													uid +
													'/friendList/' +
													friend.uid +
													'/data/' +
													msgId
												] = message;
												updates[
													'messages/' +
													friend.uid +
													'/friendList/' +
													uid +
													'/data/' +
													msgId
												] = message;
												firebase
													.database()
													.ref()
													.update(updates);
												this.setState({ email: '', visibleModal: false });
											},
										},
									],
									{ cancelable: false }
								);
							}
						})
						.catch(error => Alert.alert('Add Friend Error', error));
				} else {
					Alert.alert('Add Friend Error.', 'Server Error.');
				}
			})
			.catch(error => console.log(error));
	};

	render() {
		return (
			<SafeAreaView style={styles.safeArea}>
				<Modal
					animationType="fade"
					transparent
					visible={this.state.visibleModal}
					onRequestClose={() => {
						this.setState({ visibleModal: false });
					}}
				>
					<View style={styles.cardWrapper}>
						<Card title="Add Friend" containerStyle={styles.card}>
							<TextInput
								mode="outlined"
								theme={{ colors: { primary: '#117C6F' } }}
								label="Email"
								keyboardType="email-address"
								value={this.state.addEmail}
								onChangeText={e => this.setState({ addEmail: e })}
							/>
							<Button
								style={{ marginTop: 10 }}
								mode="contained"
								theme={{ colors: { primary: '#117C6F' } }}
								uppercase
								onPress={this.onSubmitFriend}
							>
								add
            </Button>
						</Card>
					</View>
				</Modal>
				<View style={styles.root}>
					<View style={styles.headerWrapper}>
						<Text style={styles.title}>Conversation</Text>
					</View>
					{
						this.state.isLoading &&
						<View style={[styles.bodyWrapper, { justifyContent: 'center', alignItems: 'center' }]} >
							<ActivityIndicator size="large" color="#117C6F" />
						</View>
					}
					<View style={styles.bodyWrapper}>
						{
							this.state.users.length > 0 && !this.state.isLoading &&
							<FlatList
								data={this.state.users}
								renderItem={({ item }) => this.renderRow(item)}
								keyExtractor={item => item.uid}
							/>
						}
						{
							this.state.users.length === 0 && !this.state.isLoading &&
							<View style={[styles.bodyWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
								<Text>Data Not Found</Text>
							</View>
						}
					</View>
					<FAB
						style={styles.fab}
						small
						icon="message-plus"
						onPress={() => this.setState({ visibleModal: true })}
					/>
				</View>
			</SafeAreaView>
		)
	};
};

export default ChatList;
