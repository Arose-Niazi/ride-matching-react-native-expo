import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, Image } from 'react-native';
import getCurrentLoc from "../assets/functions/getCurrentLoc";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, Switch, TextInput } from "react-native-paper";
import decodePolyline from 'decode-google-map-polyline';


function Driver() {
	const [range, setRange] = useState("20");
	const [targetLocation, setTargetLocation] = useState("");
	const [path, setPath] = useState();
	const [location, setLocation] = useState();
	const [mapLocation, setMapLocation] = useState();
	const [onDuty, setOnDuty] = useState(false);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	let interval;
	let destination = "";

	const handleNameChange = (text) => {
		setName(text);
	};

	const handleRangeChange = (text) => {
		setRange(text);
	};

	const onToggleDuty = () => {
		if (!onDuty) {
			createDrive();
		}
		setOnDuty(!onDuty);
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

	const handleDriveCreateResponse = async (response) => {
		console.log(response);
		console.log(await response.json());
		setLoading(false);
	};

	const createDrive = async () => {
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
				}
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
			.then(handleDriveCreateResponse)
			.catch((err) => { setLoading(false); console.log('Error while creating drive', err); });
	};

	const updateLocation = async () => {
		const loc = await getCurrentLoc();
		console.log(loc);
		setLocation(loc);
		if (!mapLocation) setMapLocation(loc);
	};

	const onRegionChange = (region) => {
		//setMapLocation(region);
	};

	const passengerCheck = async () => {
		if (location) {
			try {
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
						}
					}),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
				}).then(handleDriveCreateResponse);
				const target = await fetch(`https://mad.arose-niazi.me/`);
				const json = await target.json();
				console.log(json);
				if (json.newPassanger) {
					clearInterval(interval);
					destination = `${json.passangers[0].starting_point.lat},${json.passangers[0].starting_point.lng}`;
					setRoute();
					Alert.alert(`Passenger Found`, `${JSON.stringify(json.passangers[0].starting_point)} to ${JSON.stringify(json.passangers[0].ending_point)} - ${json.passangers[0].passanger}`, [
						{
							text: "Cancel",
							onPress: () => console.log("Cancel Pressed"),
							style: "cancel",
						},
					],

						{
							cancelable: true,
						}
					);
				}
			} catch (error) {
				console.log(error);
			}
		}
		else console.log("waiting for location", location, mapLocation);
	};

	useEffect(async () => {
		//interval = setInterval(passengerCheck, 5000);
		updateLocation();
		if (onDuty) {
			console.log('This is called');
			//interval = setInterval(passengerCheck, 10000);
		}
		else {
			//clearInterval(interval);
			try {
				await fetch(`https://ride-matching.herokuapp.com/api/v1/deactivate/${name}`);
				console.log("Deactivated");
			} catch (error) {
				console.log(error);
			}
		}

	}, [onDuty]);

	return (

		<View style={styles.container}>
			{loading ? <ActivityIndicator /> :
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
								label="Range"
								keyboardType={'number-pad'}
								value={range}
								onChangeText={handleRangeChange}
								style={styles.input}

							/>
						</View>
						<View style={[styles.container, { flexDirection: 'row' }]}>
							<Switch value={onDuty} onValueChange={onToggleDuty} color={"green"} />
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

export default Driver;