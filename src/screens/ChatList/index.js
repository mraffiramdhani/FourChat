import React, {useState, useEffect} from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
	safeArea: {flex: 1},
	root: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	}
})

const ChatList = (props) => {
  return (
  	<SafeAreaView style={styles.safeArea}>
	    <View style={styles.root}>
	      <Text>ChatList</Text>
	    </View>
    </SafeAreaView>
  );
};

export default ChatList;
