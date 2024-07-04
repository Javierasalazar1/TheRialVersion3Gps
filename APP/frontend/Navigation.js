import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App'; // Componente de inicio de sesión
import InicioScreen from './screens/InicioScreen'; // Pantalla de inicio

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="App" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="App" component={App} />
        <Stack.Screen name="InicioScreen" component={InicioScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
