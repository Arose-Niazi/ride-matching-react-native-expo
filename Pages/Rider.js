import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from 'react-native';
import getCurrentLoc from "../assets/functions/getCurrentLoc";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import decodePolyline from 'decode-google-map-polyline';
import showAlert from "../assets/functions/showAlert";


function Rider() {
	const [destination, setDestination] = useState("");
	const [targetLocation, setTargetLocation] = useState("");
	const [path, setPath] = useState();
	const [location, setLocation] = useState();
	const [name, setName] = useState("Arose R");
	const [loading, setLoading] = useState(false);

	const distance = 50;

	const handleDesitinationChange = (text) => {
		setDestination(text);
	};

	const handleNameChange = (text) => {
		setName(text);
	};

	const handleRequestError = (err) => {
		setLoading(false);
		console.log("Request Error", err);
	};

	const setRouteResponse = (response) => {
		setLoading(false);
		if (response.status !== 'OK') {
			showAlert("Invalid Location", "Location not found, please enter a valid location");
			return;
		}
		setPath(decodePolyline(response.routes[0].overview_polyline.points));
		setTargetLocation({ latitude: response.routes[0].legs[0].end_location.lat, longitude: response.routes[0].legs[0].end_location.lng });
	};

	const setRoute = () => {
		setLoading(true);
		fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`)
			.then(response => response.json()).then(setRouteResponse)
			.catch(handleRequestError);
	};

	const handleFindRideResponse = async (response) => {
		if (response.results > 0)
			showAlert("Ride", JSON.stringify(response));
		else
			showAlert("Ride", "No ride found");
		setLoading(false);
	};

	const findRide = async () => {
		setLoading(true);
		fetch(`https://mad.arose-niazi.me/ride/${distance}/${location.latitude},${location.longitude}/${targetLocation.latitude},${targetLocation.longitude}`)
			.then(response => response.json()).then(handleFindRideResponse)
			.catch(handleRequestError);
	};

	const updateLocation = async () => {
		setLocation(await getCurrentLoc());
	};

	const handleStartChange = (e) => {
		setLocation({
			...e.nativeEvent.coordinate,
			latitudeDelta: 0.0922,
			longitudeDelta: 0.0421
		});
	};

	useEffect(() => {
		//setInterval(updateLocation, 5000);
		if (!path)
			updateLocation();
	}, []);

	return (
		<View style={styles.container}>
			{
				loading ?
					<ActivityIndicator />
					:
					<View>
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
									<MapView showsUserLocation={true} region={location} style={styles.map} >
										<Marker
											draggable
											coordinate={{ longitude: location.longitude, latitude: location.latitude }}
											onDragEnd={handleStartChange}
										>

										</Marker>
										{targetLocation ?
											<Marker coordinate={targetLocation}>

											</Marker>
											: null
										}
										{
											path && path[0].longitude && path[0].latitude ? <Polyline coordinates={path}
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
								<Button mode="contained" style={styles.button} onPress={findRide}>Find Ride</Button>
							</View>
						</View>
					</View>
			}
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