import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import InicioScreen from './screens/InicioScreen';
import CrearPublicacionScreen from './screens/CrearPublicacionScreen';
import CrearAvisoScreen from './screens/CrearAvisoScreen';

const firebaseConfig = {
  apiKey: "AIzaSyDK71FGurfMwk2XbZ3UwzdC-uTHegEZkj4",
  authDomain: "gps2024-119de.firebaseapp.com",
  databaseURL: "https://gps2024-119de-default-rtdb.firebaseio.com",
  projectId: "gps2024-119de",
  storageBucket: "gps2024-119de.appspot.com",
  messagingSenderId: "816992076661",
  appId: "1:816992076661:web:e715cd65134c743dcc493c",
  measurementId: "G-VXR027HFXL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

      await signInWithEmailAndPassword(auth, email, password);
      setErrorMessage('');
      // Después del inicio de sesión, navega a la pantalla InicioScreen
      navigation.navigate('Inicio');
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
}

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
            <Stack.Screen name="CrearPublicacion" component={CrearPublicacionScreen} />
            <Stack.Screen name="CrearAviso" component={CrearAvisoScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </>
  );
}

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
    backgroundColor: '#FFD700',
    padding: 10,
    marginVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});