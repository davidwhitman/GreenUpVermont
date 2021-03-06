/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Platform,
    StyleSheet,
    ScrollView,
    Text,
    Alert,
    TouchableHighlight,
    View
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as actions from './actions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Constants, MapView, Location, Permissions} from 'expo';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        width: '100%'
    },
    teams: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    paragraph: {
        fontSize: 20,
        color: 'white'
    }
});
export default class TeamEditorMap extends Component {
    static propTypes = {
        actions: PropTypes.object,
        teams: PropTypes.array
    };

    static navigationOptions = {
        title: 'Team Map',
        tabBarLabel: 'Map',
        // Note: By default the icon is only shown on iOS. Search the showIcon option
        // below.
        tabBarIcon: () => (<MaterialCommunityIcons name='map-marker' size={24} color='blue'/>)
    };

    constructor(props) {
        super(props);
        this._handleMapRegionChange = this._handleMapRegionChange.bind(this);
        this._handleMapClick = this._handleMapClick.bind(this);
        this._removeMarker = this._removeMarker.bind(this);
        this._removeLastMarker = this._removeLastMarker.bind(this);
        this.state = {
            location: null,
            errorMessage: null,
            mapRegion: null,
            markers: []
        };
    }

    componentWillMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it again on your ' +
                'device!'
            });
        } else {
            this._getLocationAsync();
        }
    }

    _getLocationAsync = async () => {
        const status = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({errorMessage: 'Permission to access location was denied'});
        }

        const location = await Location.getCurrentPositionAsync({});
        const newLat = Number(location.coords.latitude);
        const newLong = Number(location.coords.longitude);
        const markers = this.state.markers.concat({
            title: 'YOU ARE HERE',
            description: 'X marks the spot',
            latlng: {
                longitude: newLong,
                latitude: newLat
            }
        });
        this.setState({
            location,
            markers,
            mapRegion: {
                latitude: newLat,
                longitude: newLong,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
        });
    };

    _handleMapClick(e) {
        const marker = {
            title: 'you clicked here',
            description: 'a lovely little spot',
            latlng: e.nativeEvent.coordinate
        };
        const markers = this.state.markers.concat(marker);
        this.setState({markers});
    }

    _removeMarker(marker) {
        return () => {
            const markers = this.state.markers.filter(_marker => (
                marker.latlng.latitude !== _marker.latlng.latitude ||
                marker.latlng.longitude !== _marker.latlng.longitude
            ));

            this.setState({markers});
        };
    }

    _removeLastMarker() {
        var markers = this.state.markers.slice(0, this.state.markers.length - 1);
        this.setState({markers});
    }


    _handleMapRegionChange(mapRegion) {
        this.setState({mapRegion});
    }

    render() {
        var markers = this
            .state
            .markers
            .map((marker, index) => (
                <MapView.Marker coordinate={marker.latlng}
                    key={index}
                    title={marker.title || 'you clicked here'}
                    onPress={this.calloutClicked}
                    onCalloutPress={this._removeMarker(marker)}
                    description={marker.descrption || 'this is pretty comfy'}
                />));
        // Let's make the marker conditional on whether we have marker data
        const mapMarker = !!(this.state.mapMarker)
            ? (
                <MapView.Marker coordinate={this.state.mapMarker.latlng}
                    title={this.state.mapMarker.title}
                    description={this.state.mapMarker.description}
                />
            ) : null;
        return (
            <View style={styles.container}>
                <Text style={styles.paragraph}>
                    Place markers where you want your team to work on. Tap on the marker text box to remove a marker.
                </Text>
                <MapView style={{alignSelf: 'stretch', height: '50%'}}
                    region={this.state.mapRegion}
                    initialRegion={
                        {
                            latitude: 44.4615298,
                            longitude: -73.218605,
                            latitudeDelta: 0.0002,
                            longitudeDelta: 0.0001
                        }
                    }
                    onPress={this._handleMapClick}
                    onRegionChange={this._handleMapRegionChange}
                >
                    {mapMarker}{markers}
                </MapView>
                {/* <Text style={styles.paragraph}>
                    Map Location: {JSON.stringify(this.state.mapRegion)}
                </Text>
                <ScrollView style={{width: '100%'}}>
                    <Text style={styles.paragraph}>
                        Markers: {JSON.stringify(this.state.markers)}
                    </Text>
                </ScrollView> */}
                <Button title={'remove last marker'}
                    onPress={this._removeLastMarker}
                />
            </View>
        );
    }
}
