/**
 /**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableHighlight, StyleSheet,
    Button, Modal, ScrollView, TextInput, Text, View
} from 'react-native';
import {Location, MapView, Permissions} from 'expo';
import TrashDrop from '../../models/trash-drop';
import CheckBox from 'react-native-checkbox';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actions from './actions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'space-around',
        backgroundColor: 'white',
        borderColor: 'white',
        borderLeftWidth: 20,
        borderRightWidth: 20,
        justifyContent: 'flex-start'
    },
    text: {
        fontSize: 30,
        justifyContent: 'flex-start',
        fontWeight: 'bold',
        margin: 10
    },
    options: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10
    }
});

const addTrashDrop = 'addTrashDrop';
const toggleTag = 'toggleTag';

function _addTrashDrop() {
    this.props.actions.dropTrash(TrashDrop.create(Object.assign({}, this.state, {location: this.state.location.coords})));
    this.setState({modalVisible: false});
}

function _toggleTag(tag) {
    return () => {
        const hasTag = this.state.tags.indexOf(tag) > -1;
        const tags = hasTag ? this.state.tags.filter(_tag => _tag !== tag) : this.state.tags.concat(tag);
        this.setState({tags});
    };
}

class TrashMap extends Component {

    static propTypes = {
        navigation: PropTypes.object,
        trashDrops: PropTypes.object
    };
    static navigationOptions = {
        title: 'Trash Tracker'
    };

    constructor(props) {
        super(props);
        this[toggleTag] = _toggleTag.bind(this);
        this._getLocationAsync = this._getLocationAsync.bind(this);
        this[addTrashDrop] = _addTrashDrop.bind(this);
        this._goToTrashDrop = this
            ._goToTrashDrop
            .bind(this);
        this.state = {
            location: {},
            modalVisible: false,
            tags: [],
            bagCount: 1,
            text: 1,
            markers: [],
            errorMessage: null
        };
    }

    componentDidMount() {
        this._getLocationAsync();
    }

    _goToTrashDrop() {
        this.setState({modalVisible: true});
    }

    _getLocationAsync = async () => {
        const {status} = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            this.setState({
                location,
                mapMarker: {
                    title: 'X',
                    pinColor: 'blue',
                    description: 'X',
                    coordinate: {
                        longitude: Number(location.coords.longitude),
                        latitude: Number(location.coords.latitude)
                    }
                },
                mapRegion: {
                    latitude: Number(location.coords.latitude),
                    longitude: Number(location.coords.longitude),
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                }
            });
        }
    };


    render() {

        function createMarker(marker, key) {
            return (
                <MapView.Marker
                    key={key}
                    pinColor={'green'}
                    coordinate={marker.location}
                    title={String('# of Bags: ' + marker.bagCount)}
                    description={marker.tags.join(', ')}
                />
            );
        }

        const myMarkerKeys = Object.keys(this.props.trashDrops || {});
        const myMarkers = myMarkerKeys.map(key => createMarker(this.props.trashDrops[key], key));
        return (
            <View style={styles.container}>
                <MapView
                    zoomEnabled={true}
                    showsUserLocation={true}
                    showsMyLocatonButton={true}
                    showsScale={true}
                    followsUserLocation={true}
                    showsCompass={true}
                    style={{alignSelf: 'stretch', height: 300}}
                >
                    {myMarkers}
                </MapView>
                <TouchableHighlight onPress={this._goToTrashDrop}>
                    <View>
                        <Text style={styles.text}>Drop Trash</Text>
                    </View>
                </TouchableHighlight>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.modalVisible}
                >
                    <ScrollView style={{marginTop: 22}}>
                        <View>
                            <TextInput
                                value={this.state.bagCount.toString()}
                                keyboardType='numeric'
                                placeholder='1'
                                style={{
                                    height: 40,
                                    borderColor: 'gray',
                                    borderWidth: 1
                                }}
                                onChangeText={(text) => this.setState({text, bagCount: Number(text)})}
                            />
                            <Text style={styles.text}>Other Items</Text>
                            <CheckBox
                                label='Needles/Bio-Waste'
                                checked={this.state.tags.indexOf('bio-waste') > -1}
                                onChange={this[toggleTag]('bio-waste')}/>
                            <CheckBox
                                label='Tires'
                                checked={this.state.tags.indexOf('tires') > -1}
                                onChange={this[toggleTag]('tires')}/>
                            <CheckBox
                                label='Large Object'
                                checked={this.state.tags.indexOf('large') > -1}
                                onChange={this[toggleTag]('large')}/>
                            <Button
                                onPress={this[addTrashDrop]}
                                title='Mark the Spot'
                                color='green'/>

                            <TouchableHighlight onPress={() => {
                                this.setState({modalVisible: false});
                            }}>
                                <Text>Cancel</Text>
                            </TouchableHighlight>

                        </View>
                    </ScrollView>
                </Modal>
            </View>
        );
    }
}


function mapStateToProps(state) {
    return {trashDrops: state.trashTracker.trashDrops};
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TrashMap);
