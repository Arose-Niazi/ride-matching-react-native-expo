import React, { useEffect, useState } from "react";
import { Image, Text, StyleSheet, View } from 'react-native';
import getCurrentLoc from "../assets/functions/getCurrentLoc";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import decodePolyline from '../assets/functions/decodePolyline';
import showAlert from "../assets/functions/showAlert";
import DatePicker from "../assets/functions/DatePicker";


function Driver() {
	const [destination, setDestination] = useState("");
	const [targetLocation, setTargetLocation] = useState("");
	const [path, setPath] = useState(0);
	const [otherPaths, setOtherPaths] = useState([]);
	const [location, setLocation] = useState();
	const [name, setName] = useState("Arose D");
	const [loading, setLoading] = useState(false);
	const [date, setDate] = useState();
	const [rides, setRides] = useState([]);

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
		console.log(`https://mad.arose-niazi.me/rides/${response.routes[0].bounds.northeast.lat}/${response.routes[0].bounds.northeast.lng}/${response.routes[0].bounds.southwest.lat}/${response.routes[0].bounds.southwest.lng}`);
		fetch(`https://mad.arose-niazi.me/rides/${response.routes[0].bounds.northeast.lat}/${response.routes[0].bounds.northeast.lng}/${response.routes[0].bounds.southwest.lat}/${response.routes[0].bounds.southwest.lng}`)
			.then(response => response.json()).then(getAllRides)
			.catch(handleRequestError);
	};

	const getAllRides = (res) => {
		console.log(res.data);
		setRides(res.data);
	};

	const setRoute = () => {
		setLoading(true);
		fetch(`https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=${location.latitude},${location.longitude}&destination=${destination}&key=AIzaSyDVqR4uEmfJa-0jmqKjsariW3kJXbQh2Hk`)
			.then(response => response.json()).then(setRouteResponse)
			.catch(handleRequestError);
	};

	const handleDriveCreateResponse = async (response) => {
		if (response.status == 200)
			showAlert("Drive", "Drive created sucessfully");
		else
			showAlert("Drive", "Failed to create drive");
		setLoading(false);
	};

	const createDrive = async () => {
		if (!date) {
			showAlert("Error", "Please select date and time first!");
			return;
		}
		console.log({
			startPoint: {
				type: 'Point',
				coordinates: [location.longitude, location.latitude]
			},
			endPoint: {
				type: 'Point',
				coordinates: [targetLocation.longitude, targetLocation.latitude]
			},
			date
		});

		setLoading(true);
		fetch('https://mad.arose-niazi.me/drive', {
			method: 'POST',
			body: JSON.stringify({
				startPoint: {
					type: 'Point',
					coordinates: [location.longitude, location.latitude]
				},
				endPoint: {
					type: 'Point',
					coordinates: [targetLocation.longitude, targetLocation.latitude]
				},
				date,
				path
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
			.then(handleDriveCreateResponse)
			.catch(handleRequestError);
	};

	const updateLocation = async () => {
		setLocation(await getCurrentLoc());
	};

	const handleDate = (date) => {
		setDate(date);
	};

	const handleStartChange = (e) => {
		setLocation({
			...e.nativeEvent.coordinate,
			latitudeDelta: 0.0922,
			longitudeDelta: 0.0421
		});
	};

	const handlePathChange = (index) => {
		if (index === path) return;
		console.log("Selected the line", index);
		setPath(index);
	};

	const findRides = () => {

	};

	useEffect(() => {
		//setInterval(updateLocation, 5000);
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
													strokeColor={path === index ? 'red' : 'grey'}
													lineDashPattern={[index]}
													tappable={true}
													onPress={() => handlePathChange(index)}
												/>
											)) : null
										}
										{
											rides.length > 0 ? rides.map((value, index) => (
												<Marker
													key={`marker${index}`}
													coordinate={{ latitude: value.startLat, longitude: value.startLng }}
												>
													<Image resizeMode="stretch" resizeMethod="resize" style={styles.mapRider} source={{ uri: `https://mad.arose-niazi.me${value.img}` }} />
												</Marker>
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
								<Button mode="contained" style={styles.button} onPress={createDrive}>Create Drive</Button>
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
	},
	mapRider:
	{
		width: 20,
		height: 20,
		borderRadius: 20
	},
});

export default Driver;