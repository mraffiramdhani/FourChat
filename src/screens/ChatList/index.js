/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, Text, FlatList, Modal, Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import { FAB, TextInput, Button } from 'react-native-paper';
import { ListItem, Avatar, Card } from 'react-native-elements';
import { connect } from 'react-redux';

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
	refresh: {
		position: 'absolute',
		margin: 16,
		left: 0,
		bottom: 0,
		padding: 5,
		backgroundColor: '#FFFFFF',
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
	friendCard: {
		width: normalize(320),
		height: normalize(400, 'height'),
	}
});

class ChatList extends Component {

	constructor(props) {
		super(props)
		this._isMounted = false;
		this.state = {
			uid: null,
			users: [],
			visibleModal: false,
			visibleFriendModal: false,
			addEmail: '',
			isLoading: true,
			friend: {},
		}
	}

	async componentDidMount() {
		this._isMounted = true;
		const uid = this.props.user.data.uid;
		this.setState({ uid });
		const dbRef = firebase.database().ref('messages').child(uid);
		dbRef.on('value', async snapshot => {
			if (snapshot.val() !== null) {
				let keyList = Object.keys(snapshot.val());
				let valList = Object.values(snapshot.val());
				await valList.map(async (item, index) => {
					const friendKey = keyList[index];
					await firebase.database().ref('users').child(friendKey).on('value', async item => {
						let person = item.val();
						let users = this.state.users;
						if (users.length === 0 && person !== null) {
							this.setState(prevState => {
								return {
									users: [...prevState.users, person],
								};
							});
						}
						else if (users.length !== 0) {
							const mapOfUID = users.map(v => { return v.uid });
							if (mapOfUID.find(ids => ids === person.uid)) {
								console.log('same person');
							}
							else {
								this.setState(prevState => {
									return {
										users: [...prevState.users, person],
									};
								});
							}
						}
					});
				});
				await this.setState({ isLoading: false });
			}
			else {
				this.setState({ users: [] });
			}
		});
	};

	onChatClicked = (person) => {
		this.state.users.map(v => {
			firebase.database().ref('users').child(v.uid).off('value');
		});
		firebase.database().ref('messages').child(this.props.user.data.uid).off('value');
		this.props.navigation.navigate('Chat', { person });
	}

	renderRow = (item) => {
		return (
			<ListItem
				onPress={() => this.onChatClicked(item)}
				title={`${item.name}`}
				subtitle={item.email}
				leftAvatar={{
					source: { uri: item.photo },
					size: 'large',
					onPress: () => {
						this.setState({
							visibleFriendModal: true,
							friend: item,
						})
					}
				}}
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
				const uid = await this.props.user.data.uid;
				const uname = await this.props.user.data.name;
				const uavatar = await this.props.user.photo;
				const db_users = await Object.values(snapshot.val());
				const friend = await db_users.find(item => item.email === this.state.addEmail);
				if (friend.uid !== undefined && friend.uid !== uid) {
					firebase.database()
						.ref(`messages`)
						.child(uid)
						.once('value', async snapshot => {
							const data = await snapshot.val();
							if (data !== null) {
								const friendList = Object.keys(data);
								const checkIfFriend = friendList.find(item => item === friend.uid);
								if (checkIfFriend !== undefined) {
									Alert.alert(
										'Add Friend Message',
										'You are already friend with this person.',
										[{ text: 'OK', style: 'cancel', onPress: () => this.setState({ addEmail: '', visibleModal: false }) }],
										{ cancelable: false }
									);
								}
								else {
									let msgId = firebase
										.database()
										.ref('messages')
										.child(uid)
										.child('friendList')
										.child(friend.uid)
										.child('data')
										.push().key;
									Alert.alert(
										'Add Friend Success',
										'Congratulation, Say Hi! to your new friend ?',
										[
											{
												text: 'Send',
												onPress: async () => {
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
														uid + '/' +
														friend.uid + '/' +
														msgId
													] = message;
													updates[
														'messages/' +
														friend.uid + '/' +
														uid + '/' +
														msgId
													] = message;
													firebase
														.database()
														.ref()
														.update(updates);
													this.setState({ addEmail: '', visibleModal: false });
												},
											},
										],
										{ cancelable: false }
									);
								}
							} else {
								let msgId = firebase
									.database()
									.ref('messages')
									.child(uid)
									.child(friend.uid)
									.push().key;
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
													uid + '/' +
													friend.uid + '/' +
													msgId
												] = message;
												updates[
													'messages/' +
													friend.uid + '/' +
													uid + '/' +
													msgId
												] = message;
												firebase
													.database()
													.ref()
													.update(updates);
												this.setState({ addEmail: '', visibleModal: false });
											},
										},
									],
									{ cancelable: false }
								);
							}
						})
						.catch(error => Alert.alert('Add Friend Error', error));
				}
				else if (friend.uid === uid) {
					Alert.alert(
						'Add Friend Message',
						'You Cannot Add Yourself to Your Friend List.',
						[{ text: 'OK', style: 'cancel', onPress: () => this.setState({ addEmail: '', visibleModal: false }) }],
						{ cancelable: false }
					);
				}
				else {
					Alert.alert('Add Friend Error.', 'Server Error.');
				}
				// }
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
						<Card
							title={
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
									<Text style={{ fontSize: 18, fontFamily: 'Nunito-Regular' }}>Add Friend</Text>
									<Icon name="ios-close" size={30} onPress={() => this.setState({ visibleModal: false })} />
								</View>
							}
							containerStyle={styles.card}
						>
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
				<Modal
					animationType="fade"
					transparent
					visible={this.state.visibleFriendModal}
					onRequestClose={() => {
						this.setState({ visibleFriendModal: false });
					}}
				>
					<View style={styles.cardWrapper}>
						<Card title={
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
								<Text style={{ fontSize: 18, fontFamily: 'Nunito-Regular' }}>{this.state.friend.name}</Text>
								<Icon name="ios-close" size={30} onPress={() => this.setState({ visibleFriendModal: false })} />
							</View>
						}
							containerStyle={styles.friendCard}
						>
							<View style={{ flexDirection: 'column', alignItems: 'center', margin: 10 }}>
								<Avatar
									rounded
									source={{ uri: this.state.friend.photo }}
									size="xlarge"
								/>
								<View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 15 }}>
									<Text style={{ fontSize: 22, fontFamily: 'Nunito-Bold' }}>{this.state.friend.name}</Text>
									<Text style={{ fontSize: 14, fontFamily: 'Nunito-Regular', color: '#444' }}>{this.state.friend.email}</Text>
								</View>
								<Button
									mode="contained"
									theme={{ colors: { primary: '#117C6F' } }}
									uppercase
									style={{ width: '100%' }}
									onPress={() => {
										this.setState({ visibleFriendModal: false });
										this.onChatClicked(this.state.friend);
									}}
								>
									chat now
            		</Button>
							</View>
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

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default connect(mapStateToProps)(ChatList);
