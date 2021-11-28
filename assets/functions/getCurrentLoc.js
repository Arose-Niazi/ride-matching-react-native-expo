import * as Location from "expo-location";

export default async function getCurrentLoc() {

	try {
		const { granted } = await Location.requestForegroundPermissionsAsync();
		if (!granted) return;
		const {
			coords: { latitude, longitude },
		} = await Location.getCurrentPositionAsync();
		return {
			latitude,
			longitude,
			latitudeDelta: 0.0922,
			longitudeDelta: 0.0421,
		};
	} catch (error) {
		console.log(error);
	}
	return;
};