import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View } from 'react-native';
import getCurrentLoc from "../assets/functions/getCurrentLoc";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import decodePolyline from '../assets/functions/decodePolyline';
import showAlert from "../assets/functions/showAlert";
import DatePicker from "../assets/functions/DatePicker";


function Rider() {
	const [destination, setDestination] = useState("");
	const [targetLocation, setTargetLocation] = useState("");
	const [path, setPath] = useState(0);
	const [otherPaths, setOtherPaths] = useState([]);
	const [location, setLocation] = useState();
	const [name, setName] = useState("Arose R");
	const [loading, setLoading] = useState(false);
	const [date, setDate] = useState();

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
		let paths = [];
		for (let index = 0; index < response.routes.length; index++) {
			const element = response.routes[index];
			paths[index] = decodePolyline(element.overview_polyline.points);
		}
		setOtherPaths(paths);
		setPath(0);
		setTargetLocation({ latitude: response.routes[0].legs[0].end_location.lat, longitude: response.routes[0].legs[0].end_location.lng });
	};

	const setRoute = () => {
		setLoading(true);
		console.log(`https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`);
		fetch(`https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`)
			.then(response => response.json()).then(setRouteResponse)
			.catch(handleRequestError);
	};

	const handleFindRideResponse = async (response) => {
		console.log(response);
		if (response.results > 0) {
			let drives = [];
			for (let index = 0; index < response.data.data.length; index++) {
				const element = response.data.data[index];
				drives[index] = {
					ride: index,
					time: element.time,
				};
			}
			showAlert("Ride", JSON.stringify(drives));
			const { startPoint, endPoint } = response.data.data[0];
			setLocation({ ...location, latitude: startPoint[0], longitude: startPoint[1] });
			setDestination(`${endPoint[0]},${endPoint[1]}`);
			setRoute();
		}
		else
			showAlert("Ride", "No ride found");
		setLoading(false);
	};

	const findRide = async () => {
		setLoading(true);
		console.log({
			time: date.getTime(),
			start: [location.latitude, location.longitude],
			end: [targetLocation.latitude, targetLocation.longitude]
		});
		fetch('https://mad.arose-niazi.me/ride/find', {
			method: 'POST',
			body: JSON.stringify({
				time: date.getTime(),
				start: [location.latitude, location.longitude],
				end: [targetLocation.latitude, targetLocation.longitude]
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
			.then(res => res.json())
			.then(handleFindRideResponse)
			.catch(handleRequestError);
	};

	const handleCreateRideResponse = async (response) => {
		if (response.status == 200)
			showAlert("Ride", "Ride created sucessfully");
		else
			showAlert("Ride", "Failed to create ride");
		setLoading(false);
	};

	const addRide = async () => {
		setLoading(true);
		fetch('https://mad.arose-niazi.me/ride/create', {
			method: 'POST',
			body: JSON.stringify({
				time: date.getTime(),
				start: [location.latitude, location.longitude],
				end: [targetLocation.latitude, targetLocation.longitude],
				name
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
			.then(handleCreateRideResponse)
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

	const handleDate = (date) => {
		setDate(date);
	};

	const handlePathChange = (index) => {
		if (index === path) return;
		console.log("Selected the line", index);
		setPath(index);
	};

	useEffect(() => {
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
						{date && <Text style={{ padding: 20 }}>{date.toISOString()}</Text>}
						<DatePicker dateInput={handleDate} />
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
											otherPaths.length > 0 && path < otherPaths.length ? otherPaths.map((value, index) => (
												<Polyline
													key={index}
													coordinates={value}
													strokeWidth={4}
													strokeColor={'green'}
													lineDashPattern={[index]}
													tappable={true}
													onPress={() => handlePathChange(index)}
												/>
											)) : null
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
								<Button mode="contained" style={styles.button} onPress={addRide}>Add Ride</Button>
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