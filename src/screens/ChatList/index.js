/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text, ScrollView, FlatList, Modal, Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import { FAB, TextInput, Button } from 'react-native-paper';
import { ListItem, Avatar, Card } from 'react-native-elements';
import { db, setData, pushData, users, avatar } from '../../config/initialize';
import firebase from 'react-native-firebase';

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
		}
	}

	async componentDidMount() {
		const uid = await AsyncStorage.getItem('userid');
		const dbRef = db().ref('messages/' + uid + '/friendList');
		dbRef.on('value', async snapshot => {
			let keyList = Object.keys(snapshot.val());
			let valList = Object.values(snapshot.val());
			await valList.map(async (item, index) => {
				const friendKey = keyList[index];
				await db().ref('users/' + friendKey).on('value', async item => {
					await this.setState(prevState => {
						return {
							users: [...prevState.users, { uid: friendKey, data: item.val() }],
						};
					});
				});
			});
		});
	};

	friendAvatar = async source => {
		var srcPhoto = null
		await avatar(source).getDownloadURL().then(file => {
			srcPhoto = { uri: file }
		});
		return (
			<Avatar
				rounded
				size="large"
				source={srcPhoto !== null ? srcPhoto : require('../../assets/images/4chat.png')}
				onPress={() => console.log('avatar clicked')}
			/>
		);
	};

	renderRow = async ({ item }) => {
		console.log(item);
		return (
			<ListItem
				onPress={() => console.log('item clicked')}
				title={`${item.data.name}`}
				subtitle={item.data.email}
				leftAvatar={{ source: require('../../assets/images/default.png') }}
				containerStyle={{ borderBottomWidth: 0 }}
				bottomDivider
				topDivider
			/>
		);
	};

	render() {
		if (!this.state.users.length > 0) {
			return (
				<Text style={{ fontSize: 100 }}>Loading</Text>
			);
		}
		else {
			return (
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.root}>
						<View style={styles.headerWrapper}>
							<Text style={styles.title}>Conversation</Text>
						</View>
						<View style={styles.bodyWrapper}>
							<ScrollView showsVerticalScrollIndicator={false}>
								{
									this.state.users.map((v, i) => {
										return (
											<ListItem
												key={v.data.uid}
												onPress={() => console.log('item clicked')}
												title={`${v.data.name}`}
												subtitle={v.data.email}
												containerStyle={{ borderBottomWidth: 0 }}
												bottomDivider
												topDivider
											/>
										)
									})
								}
							</ScrollView>
						</View>
					</View>
				</SafeAreaView>
			)
		}
	}

};

export default ChatList;
