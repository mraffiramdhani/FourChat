import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { FAB } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import { db, setData, pushData, setListener, users } from "../../config/initialize";


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
});

const ChatList = (props) => {

	const [isAuth, setAuth] = useState(false);
	const [uid, setUID] = useState(null);
	const [email, setEmail] = useState(null);
	const [friendList, setFriendList] = useState([]);

	const [isLoading, setLoading] = useState(false);
	const [isError, setError] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		// makeRemoteRequest();
		fetchFriendList();
	}, []);

	const fetchFriendList = async () => {
		await users().onAuthStateChanged(async user => {
			if(user){
				setAuth(true);
				setUID(user.uid);
				setEmail(user.email);
				await setListener('messages/' + uid, async snapshot => {
					if(typeof snapshot.friendList !== "undefined") {
						const keyList = await Object.keys(snapshot.val().friendList);
						const valList = await Object.values(snapshot.val().friendList);
						await valList.map( async (v, i) => {
							const uid = await keyList[i];
							await db().ref('users/' + uid).on('value', async snapshot => {
								await friendList.push({
									uid,
									data: snapshot.val()
								});
							});
						});
					}
				});
			}
			else {
				await props.navigation.navigate('Login');
			}
		});
	};

	const userAvatar = source => {
		return (
			<Avatar
				rounded
				size="medium"
			  source={{
			    uri:
			      source,
			  }}
			  onPress={() => console.log('avatar clicked')}
			/>
		);
	};

	const renderRow = ({ item }) => {
		return (
			<ListItem
				onPress={() => console.log('item clicked')}
				title={`${item.name.first} ${item.name.last}`}
				subtitle={item.email}
				leftAvatar={userAvatar(item.picture.thumbnail)}
				containerStyle={{ borderBottomWidth: 0 }}
				bottomDivider
				topDivider
			/>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.headerWrapper}>
					<Text style={styles.title}>Conversation</Text>
				</View>
				<View style={styles.bodyWrapper}>
					{/*<FlatList
						data={data}
						renderItem={renderRow}
						keyExtractor={item => item.email}
						onRefresh={() => console.log('refresh')}
						refreshing={refreshing}
					/>*/}
				</View>
				<FAB
					style={styles.fab}
			    small
			    icon="chat"
			    onPress={() => console.log('Pressed')}
		    />
			</View>
		</SafeAreaView>
	);
};

export default ChatList;
