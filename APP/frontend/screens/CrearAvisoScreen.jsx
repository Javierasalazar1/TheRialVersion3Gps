import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Picker } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { uploadFileToStorage } from '../firebasestorage'; // Asegúrate de que esta función esté correctamente implementada
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = [
  { label: 'Tareas', value: 'Tareas' },
  { label: 'Apuntes', value: 'Apuntes' },
  { label: 'Eventos', value: 'Eventos' },
  { label: 'Servicios', value: 'Servicios' },
  { label: 'Anuncios', value: 'Anuncios' },
  { label: 'Cosas Perdidas', value: 'Cosas Perdidas' },
  { label: 'Deportes', value: 'Deportes' },
  { label: 'Otros', value: 'Otros' },
];

const CrearAvisoScreen = () => {
  const [image, setImage] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState(categories[0].value);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      setCurrentUser(auth.currentUser);

      // Recupera el nombre de usuario desde AsyncStorage
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error al recuperar el nombre de usuario:', error);
      }
    };

    fetchUserData();

    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder a la galería de imágenes.');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!titulo || !contenido) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (!currentUser) {
      alert('Debes estar autenticado para crear un aviso.');
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      let imageUrl = null;

      if (image) {
        try {
          imageUrl = await uploadFileToStorage({
            uri: image,
            name: `${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
          console.log('Image URL:', imageUrl);
        } catch (imageError) {
          console.error('Error al subir la imagen:', imageError);
          throw new Error('Error al subir la imagen: ' + imageError.message);
        }
      }

      const docRef = await addDoc(collection(db, 'avisos'), {
        titulo,
        contenido,
        categoria,
        fecha: new Date().toISOString(),
        imagen: imageUrl,
        userId: currentUser.uid,
        username: username, // Almacena el nombre de usuario en el documento
      });

      console.log('Documento agregado con ID: ', docRef.id);

      setImage(null);
      setTitulo('');
      setContenido('');
      setCategoria(categories[0].value);
      setLoading(false);
      alert('Aviso subido con éxito!');
    } catch (error) {
      console.error('Error al subir la publicación:', error);
      setLoading(false);
      alert('Hubo un error al subir la publicación: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.uploadText}>Selecciona una imagen</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contenido"
        value={contenido}
        onChangeText={setContenido}
        multiline
      />
      <Text style={styles.label}>Seleccionar categoría:</Text>
      <Picker
        selectedValue={categoria}
        style={styles.input}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        {categories.map((category) => (
          <Picker.Item key={category.value} label={category.label} value={category.value} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
        <Text style={styles.uploadButtonText}>Subir Aviso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    fontSize: 16,
    color: 'gray',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CrearAvisoScreen;
