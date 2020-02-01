import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text, FlatList, Modal, Alert } from 'react-native';
import { FAB, TextInput, Button } from 'react-native-paper';
import { ListItem, Avatar, Card } from 'react-native-elements';
import { db, setData, pushData, setListener, users, avatar } from "../../config/initialize";

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
  	backgroundColor: 'rgba(0,0,0,0.3)'
  },
  card: {
  	width: normalize(320), 
  	height: normalize(200, 'height')
  },
});

const ChatList = (props) => {

	const [uid, setUID] = useState(null);
	const [email, setEmail] = useState(null);
	const [addEmail, setAddEmail] = useState(null);
	const [friendList, setFriendList] = useState([]);

	const [isLoading, setLoading] = useState(true);
	const [isError, setError] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const [visibleModal, setModalVisibility] = useState(false);

	useEffect(() => {
		fetchFriendList();
	}, []);

	const fetchFriendList = async () => {		
		const user = await users().currentUser;
		if(user){
			await setUID(user.uid);
			await setEmail(user.email);
			await setListener('messages/' + user.uid, async snapshot => {
				if (typeof snapshot.val().friendList !== "undefined") {
					const keyList = await Object.keys(snapshot.val().friendList);
					const valList = await Object.values(snapshot.val().friendList);
					await valList.map(async (v, i) => {
						const friendUID = await keyList[i];
						await db().ref('users/' + friendUID).on('value', async dataSnap => {
							await friendList.push({
								uid: friendUID,
								data: dataSnap.val(),
							});
						});
					});
				}
			});
		}
		else{
			await props.navigation,navigate('Login');
		}
	};

	const onSubmitFriend = () => {
		db().ref('users').once('value')
		.then(async snapshot => {
			const db_users = await Object.values(snapshot.val());
			const friend = await db_users.find(item => item.email === addEmail);
			if(friend.uid !== undefined){
				db().ref('messages/' + uid).once('value', async snapshot => {
					if (typeof snapshot.val().friendList != "undefined"){
						const friendList = Object.keys(snapshot.val().friendList);
						const checkIfFriend = friendList.find(item => item === friend.uid);
						if(checkIfFriend !== undefined){
							Alert.alert(
								'Add Friend Message',
								'You are already friend with this person.',
								[
									{text: 'OK', style: 'cancel'},
								],
								{cancelable: false},
							);
						}
						else {
							await setData('messages/' + uid + '/friendList/' + friend.uid, { data: true });

							Alert.alert(
								'Add Friend Success',
								'Congratulation, Say Hi! to your new friend ?',
								[
									{
										text: 'Send',
										onPress: async () => {
											await pushData('messages/' + uid + '/friendList/' + friend.uid + '/data', {
												incoming: false,
												message: 'Hi! >_<',
												createAt: Date.parse(new Date()),
											});

											await setData('messages/' + friend.uid + '/friendList/' + uid, {
												data: true,
											});

											await pushData('messages/' + friend.uid + '/friendList/' + uid + '/data', {
												incoming: true,
												message: 'Hi! >_<',
												createAt: Date.parse(new Date()),
											});
										},
									},
									{
										text: 'Skip',
										style: 'cancel',
									}
								],
								{cancelable: false},
							);
						}
					}
					else {
						await setData('messages/' + uid + '/friendList/' + friend.uid, {
							data: true,
						});

						Alert.alert(
							'Add Friend Success',
							'Congratulation, Say Hi! to your new friend ?',
							[
								{
									text: 'Send',
									onPress: async () => {
										await pushData('messages/' + uid + '/friendList/' + friend.uid + '/data', {
											incoming: false,
											message: 'Hi! >_<',
											createAt: Date.parse(new Date()),
										});

										await setData('messages/' + friend.uid + '/friendList/' + uid, {
											data: true,
										});

										await pushData('messages/' + friend.uid + '/friendList/' + uid + '/data', {
											incoming: true,
											message: 'Hi! >_<',
											createAt: Date.parse(new Date()),
										});
									},
								},
								{
									text: 'Skip',
									style: 'cancel',
								}
							],
							{cancelable: false},
						);
					}
				}).catch((error) => Alert.alert('Add Friend Error', error));
			}
			else {
				Alert.alert('Add Friend Error.', 'Server Error.');
			}
		}).catch((error) => console.log(error));
	};

	const userAvatar = async source => {
		var srcPhoto = null;
		await avatar(source).getDownloadURL().then(file => srcPhoto = { uri: file });
		return (
			<Avatar
				rounded
				size="large"
			  source={srcPhoto}
			  onPress={() => console.log('avatar clicked')}
			/>
		);
	};

	const renderRow = ({ item }) => {
		return (
			<ListItem
				onPress={() => console.log('item clicked')}
				title={`${item.data.name}`}
				subtitle={item.data.email}
				leftAvatar={userAvatar(item.data.photo)}
				containerStyle={{ borderBottomWidth: 0 }}
				bottomDivider
				topDivider
			/>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<Modal
        animationType="fade"
        transparent={true}
        visible={visibleModal}
        onRequestClose={() => {
          setModalVisibility(false);
        }}>
        <View style={styles.cardWrapper}>
          <Card title="Add Friend" containerStyle={styles.card}>
          	<TextInput
          		mode="outlined"
          		theme={{colors: {primary: '#117C6F'}}}
          		label="Email"
          		keyboardType="email-address"
          		value={addEmail}
          		onChangeText={e => setAddEmail(e)}
          	/>
          	<Button
          		style={{marginTop: 10}}
          		mode="contained"
          		theme={{colors: {primary: '#117C6F'}}} 
          		uppercase
          		onPress={onSubmitFriend}
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
				<View style={styles.bodyWrapper}>
					{
						isLoading && 
						<Text>Loading</Text>
					}
					{
						friendList && !isLoading &&
						<FlatList
							data={friendList}
							renderItem={renderRow}
							keyExtractor={item => item.data.email}
							onRefresh={() => console.log('refresh')}
							refreshing={refreshing}
						/>
					}
				</View>
				<FAB
					style={styles.fab}
			    small
			    icon="message-plus"
			    onPress={() => setModalVisibility(true)}
		    />
			</View>
		</SafeAreaView>
	);
};

export default ChatList;
