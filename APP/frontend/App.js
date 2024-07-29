import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // Importar axios
import { AuthProvider } from './AuthContext';
import InicioScreen from './screens/InicioScreen';
import CrearPublicacionScreen from './screens/CrearPublicacionScreen';
import PerfilScreen from './screens/PerfilScreen';
import CrearAvisoScreen from './screens/CrearAvisoScreen';
import CrearMercado from './screens/CrearMercado';
import ModeracionScreen from './screens/ModeracionScreen';
import ReportesScreen from './screens/ReportesScreen';

const Stack = createStackNavigator();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage('Por favor, ingresa el correo y la contraseña.');
        return;
      }

      const response = await axios.post('http://localhost:4000/api/auth/signin', {
        email,
        password
      });

      if (response.status === 200 && response.data.token) {
        // Almacenar el token en AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);

          // Almacenar los usuaerios en AsyncStorage
          await AsyncStorage.setItem('username',response.data.username);
        // Almacenar los roles en AsyncStorage
        await AsyncStorage.setItem('roles', response.data.roles);

        setErrorMessage('');

        console.log('Nombre de usuario:', response.data.username);
        navigation.navigate('Inicio');
      } else {
        setErrorMessage('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      setErrorMessage('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };


  return (
    <View style={styles.container}>
      <Image source={require('./assets/ubb.png')} style={styles.logo} />
      <Text style={styles.title}>Ingresar</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const App = () => {
  return (
    <>
      <style>
        {`
          body, html {
            height: 100%;
            margin: 0;
            overflow: auto; /* Permitir scroll en todo el cuerpo */
          }
          #root {
            height: 100%;
          }
        `}
      </style>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Inicio" component={InicioScreen} />
            <Stack.Screen name="Crear Publicacion" component={CrearPublicacionScreen} />
            <Stack.Screen name="Crear Aviso" component={CrearAvisoScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Publicar Producto" component={CrearMercado} />
            <Stack.Screen name="Moderación" component={ModeracionScreen} />
            <Stack.Screen name="Reportes" component={ReportesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#143d5c',
    padding: 10,
    marginVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});