import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const PerfilScreen = () => {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUser(userData);
        setNombre(userData.nombre || '');
        setTelefono(userData.telefono || '');
        setFoto(userData.foto || null);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const actualizarPerfil = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      let fotoUrl = foto;
      if (foto && foto.startsWith('file://')) {
        const response = await fetch(foto);
        const blob = await response.blob();
        const storageRef = ref(storage, `perfil/${currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        fotoUrl = await getDownloadURL(storageRef);
      }

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        nombre,
        telefono,
        foto: fotoUrl,
      });

      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  if (!user) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: foto || 'https://via.placeholder.com/150' }} style={styles.foto} />
      <Button title="Cambiar foto" onPress={pickImage} />

      <Text style={styles.label}>Correo:</Text>
      <Text>{user.email}</Text>

      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ingrese su nombre"
      />

      <Text style={styles.label}>Teléfono:</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ingrese su teléfono"
        keyboardType="phone-pad"
      />

      <Button title="Actualizar perfil" onPress={actualizarPerfil} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  foto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
  },
});

export default PerfilScreen;