import React, { Component } from 'react'
import { Text, Image, View, Dimensions, ToastAndroid, PermissionsAndroid, Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firebase from 'react-native-firebase';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class NearMe extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initial: 'state',
      mapRegion: null,
      latitude: 0,
      longitude: 0,
      userList: [],
      uid: null
    }
  }

  componentDidMount = async () => {
    await this.getUser();
    await this.getLocation();
  }

  getUser = async () => {
    const uid = await AsyncStorage.getItem('userid');
    await this.setState({ uid });
    await firebase
      .database()
      .ref('users/')
      .on('child_added', async snapshot => {
        let data = snapshot.val();
        if (data !== null && data.uid !== uid) {
          this.setState(prevState => {
            return { userList: [...prevState.userList, data] }
          });
        }
      });
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
        position => {
          let region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.00421 * 1.5,
          }
          this.setState({
            mapRegion: region,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
        },
        error => {
          this.setState({ errorMessage: error });
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

  render() {
    return (
      <MapView
        style={{ width: '100%', height: '100%' }}
        showsMyLocationButton
        showsIndoorLevelPicker
        showsUserLocation
        zoomControlEnabled
        showsCompass
        showsTraffic
        region={this.state.mapRegion}
        initialRegion={{
          latitude: -7.755322,
          longitude: 110.381174,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {
          this.state.userList.map(item => {
            return (
              <Marker
                key={item.uid}
                title={item.name}
                description={item.status}
                draggable
                coordinate={{
                  latitude: item.latitude || 0,
                  longitude: item.longitude || 0,
                }}
              >
                <View>
                  <Image
                    source={require('../../assets/images/default.png')}
                    style={{ width: 40, height: 40 }}
                  />
                  <Text>{item.name}</Text>
                </View>
              </Marker>
            )
          })
        }
      </MapView>
    )
  }
}

export default NearMe;
