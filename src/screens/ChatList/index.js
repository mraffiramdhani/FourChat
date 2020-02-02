/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text, FlatList, Modal, Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import { FAB, TextInput, Button } from 'react-native-paper';
import { ListItem, Avatar, Card } from 'react-native-elements';
import { db, setData, pushData, users, avatar } from '../../config/initialize';

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
			users: [],
			visibleModal: false,
			addEmail: '',
			isLoading: true,
		}
	}

	async componentDidMount() {
		const uid = await AsyncStorage.getItem('userid');
		const dbRef = db().ref('messages/' + uid);
		dbRef.on('child_added', async snapshot => {
			let keyList = Object.keys(snapshot.val());
			let valList = Object.values(snapshot.val());
			await valList.map(async (item, index) => {
				const friendKey = keyList[index];
				await db().ref('users/' + friendKey).on('value', async item => {
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
				leftAvatar={{ source: { uri: 'https://raw.githubusercontent.com/FaridSafi/react-native-gifted-chat/sponsor-lereacteur/media/logo_sponsor.png' } }}
				containerStyle={{ borderBottomWidth: 0 }}
				bottomDivider
				topDivider
			/>
		);
	};

	onSubmitFriend = () => {
		db()
			.ref('users')
			.once('value')
			.then(async snapshot => {
				const uid = await AsyncStorage.getItem('userid');
				const db_users = await Object.values(snapshot.val());
				const friend = await db_users.find(item => item.email === this.state.addEmail);
				if (friend.uid !== undefined) {
					db()
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
									await setData(`messages/${uid}/friendList/${friend.uid}`, { data: true });

									Alert.alert(
										'Add Friend Success',
										'Congratulation, Say Hi! to your new friend ?',
										[
											{
												text: 'Skip',
												style: 'cancel',
											},
											{
												text: 'Send',
												onPress: async () => {
													await pushData(`messages/${uid}/friendList/${friend.uid}/data`, {
														incoming: false,
														message: 'Hi! >_<',
														createdAt: Date.parse(new Date()),
													});

													await setData(`messages/${friend.uid}/friendList/${uid}`, {
														data: true,
													});

													await pushData(`messages/${friend.uid}/friendList/${uid}/data`, {
														incoming: true,
														message: 'Hi! >_<',
														createdAt: Date.parse(new Date()),
													});
												},
											},
										],
										{ cancelable: false }
									);
								}
							} else {
								await setData(`messages/${uid}/friendList/${friend.uid}`, {
									data: true,
								});

								Alert.alert(
									'Add Friend Success',
									'Congratulation, Say Hi! to your new friend ?',
									[
										{
											text: 'Skip',
											style: 'cancel',
										},
										{
											text: 'Send',
											onPress: async () => {
												await pushData(`messages/${uid}/friendList/${friend.uid}/data`, {
													incoming: false,
													message: 'Hi! >_<',
													createdAt: Date.parse(new Date()),
												});

												await setData(`messages/${friend.uid}/friendList/${uid}`, {
													data: true,
												});

												await pushData(`messages/${friend.uid}/friendList/${uid}/data`, {
													incoming: true,
													message: 'Hi! >_<',
													createdAt: Date.parse(new Date()),
												});
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
