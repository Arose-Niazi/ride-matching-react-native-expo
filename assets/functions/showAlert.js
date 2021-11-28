import { Alert } from "react-native";

export default function showAlert(title, body) {

	Alert.alert(title, body,
		[
			{
				text: "Cancel",
				style: "cancel",
			},
		],
		{
			cancelable: true,
		}
	);

};