import React, { useState, useEffect } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';


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
		backgroundColor: '#289C8E',
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
});

const ChatList = (props) => {

	const [isLoading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [page, setPage] = useState(1);
	const [seed, setSeed] = useState(1);
	const [isError, setError] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		makeRemoteRequest();
	}, []);

	const makeRemoteRequest = () => {
		const url = `https://randomuser.me/api/?seed=${seed}&page=${page}&results=20`;
		setLoading(true);
		fetch(url)
			.then(res => res.json())
			.then(res => {
				setData(page === 1 ? res.results : [...this.state.data, ...res.results]);
				setError(res.error || null);
				setLoading(false);
				setRefreshing(false);
			})
			.catch(error => {
				setError(error);
				setLoading(false);
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
					<FlatList
						data={data}
						renderItem={renderRow}
						keyExtractor={item => item.email}
						onRefresh={() => console.log('refresh')}
						refreshing={refreshing}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default ChatList;
