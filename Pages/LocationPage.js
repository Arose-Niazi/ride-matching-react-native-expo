import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View } from 'react-native';
import * as Location from "expo-location";

import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import decodePolyline from '../assets/functions/decodePolyline';
import showAlert from "../assets/functions/showAlert";
import { firebase } from '@react-native-firebase/database';

const path = 'https://res-ihop-app-default-rtdb.europe-west1.firebasedatabase.app';



function LocationPage() {
	const reference = firebase
		.app()
		.database(path)
		.ref('/live');

	const [location, setLocation] = useState('Empty');
	const [name, setName] = useState("Arose R");

	const handleNameChange = (text) => {
		setName(text);
	};

	const handleRequestError = (err) => {
		console.log("Request Error", err);
	};

	const handleNewLocation = (loc) => {
		const { longitude, latitude } = loc;
		setLocation(JSON.stringify({ longitude, latitude }));
		console.log('Location Update', loc);
		reference
			.ref(`/Live/${name}`)
			.set({
				lat: latitude,
				lng: longitude,
			})
			.then(() => console.log('Data set.'));
	};

	const setRoute = () => {
		Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 1000 }, handleNewLocation);
	};

	const findRide = async () => {

	};

	return (
		<View style={styles.container}>
			<View>
				<View style={[styles.container]}>

					<TextInput
						label="Name"
						value={name}
						onChangeText={handleNameChange}
						style={styles.input}

					/>
				</View>

				<View style={[styles.container, { flex: 2 }]}>
					<View>
						<Text>{location}</Text>
					</View>
					<View style={[styles.container, { flexDirection: 'row' }]}>
						<Button mode="contained" style={styles.button} onPress={setRoute}>Share</Button>
						<Button mode="contained" style={styles.button} onPress={findRide}>Load</Button>
					</View>
				</View>
			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	map: {
		flex: 1,
		height: 100,
		width: 400
	},
	playerMarker: { width: 26, height: 28 },
	button: {
		padding: 10,
		margin: 10
	},
	input: {
		height: 60,
		width: 300
	}
});

export default LocationPage;