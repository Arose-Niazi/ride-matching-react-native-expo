import React, { useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import getCurrentLoc from "../assets/functions/getCurrentLoc";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import decodePolyline from 'decode-google-map-polyline';


function Rider() {

	const [destination, setDestination] = useState("");
	const [targetLocation, setTargetLocation] = useState("");
	const [path, setPath] = useState();
	const [location, setLocation] = useState();
	const [mapLocation, setMapLocation] = useState();
	const [name, setName] = useState("");

	const handleDesitinationChange = (text) => {
		setDestination(text);
	};

	const handleNameChange = (text) => {
		setName(text);
	};

	const setRoute = async () => {
		try {
			const target = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`);

			console.log(`https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`);
			const json = await target.json();
			console.log(json.routes[0].legs[0].end_location.lat);
			setPath(decodePolyline(json.routes[0].overview_polyline.points));
			setTargetLocation({ latitude: json.routes[0].legs[0].end_location.lat, longitude: json.routes[0].legs[0].end_location.lng });
			console.log("Pass", targetLocation);
			console.log("Pass", path);
		} catch (error) {
			console.log(error);
			setPath(undefined);
			setTargetLocation(undefined);
		}
	};

	const updateLocation = async () => {
		const loc = await getCurrentLoc();
		setLocation(loc);
		if (!mapLocation) setMapLocation(loc);
	};

	const onRegionChange = (region) => {
		setMapLocation(region);
	};

	useEffect(() => {
		//setInterval(updateLocation, 5000);
		updateLocation();
	}, []);

	return (
		<View style={styles.container}>
			<View style={[styles.container]}>
				<TextInput
					label="Name"
					value={name}
					onChangeText={handleNameChange}
					style={styles.input}

				/>
			</View>
			<View style={{ flex: 5 }}>
				{
					location ?
						<MapView onRegionChangeComplete={onRegionChange} showsUserLocation={true} region={mapLocation} style={styles.map} >
							{/* <Marker coordinate={{ longitude: location.longitude, latitude: location.latitude }} >
								<View style={{ backgroundColor: "#00ff0055", padding: 10, borderRadius: 100 }}></View>
							</Marker> */}
							{targetLocation ?
								<Marker coordinate={targetLocation}>

								</Marker>
								: null
							}
							{
								path ? <Polyline coordinates={path}
									strokeWidth={2}
									strokeColor="red"
									lineDashPattern={[1]} /> : null
							}
						</MapView>
						: <View style={styles.container}><ActivityIndicator /></View>
				}
			</View>
			<View style={[styles.container, { flex: 2 }]}>
				<View style={styles.container}>
					<TextInput
						label="Destination"
						value={destination}
						onChangeText={handleDesitinationChange}
						style={styles.input}

					/>
				</View>
				<View style={[styles.container, { flexDirection: 'row' }]}>
					<Button mode="contained" style={styles.button} onPress={setRoute}>Search</Button>
					<Button mode="contained" style={styles.button} onPress={setRoute}>Find Driver</Button>
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

export default Rider;