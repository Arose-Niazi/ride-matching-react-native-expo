import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Rider from './Pages/Rider';
import Driver from './Pages/Driver';
import LocationPage from './Pages/LocationPage';


const Tab = createBottomTabNavigator();

export default class App extends React.Component {
  render() {
    return (<NavigationContainer>
      <Tab.Navigator style={{ margin: 0, padding: 0 }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Rider') {
              iconName = focused
                ? 'map'
                : 'map-outline';
            } else if (route.name === 'Driver') {
              iconName = focused ? 'car' : 'car-outline';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}

      >
        <Tab.Screen
          name="Location"
          component={LocationPage}
        />
        <Tab.Screen
          name="Rider"
          component={Rider}
        />
        <Tab.Screen
          name="Driver"
          component={Driver}
        />


      </Tab.Navigator></NavigationContainer>
    );
  }
};