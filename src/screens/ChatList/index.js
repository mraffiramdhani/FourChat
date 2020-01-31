import React, {useState, useEffect} from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import normalize from 'react-native-normalize';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Button, IconButton, List, Divider } from 'react-native-paper';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

const styles = StyleSheet.create({
	safeArea: {flex: 1},
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

const ChatItem = ({title, id}) => {
	return (
		<List.Item title={title} description={id} left={props => <List.Icon {...props} icon="folder" />} />
	);
};

const ChatList = (props) => {
	const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
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
	      		data={DATA}
	      		itemSeparatorComponent={renderSeparator}
        		renderItem={({ item }) => <ChatItem title={item.title} id={item.id} />}
        		keyExtractor={item => item.id}
	      	/>
	      </View>
	    </View>
    </SafeAreaView>
  );
};

export default ChatList;
