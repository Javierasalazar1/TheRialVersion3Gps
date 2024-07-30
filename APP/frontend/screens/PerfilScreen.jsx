import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { uploadFileToStorage } from '../firebasestorage'; // Asegúrate de que esta función esté correctamente implementada

const PerfilScreen = () => {
  const [image, setImage] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setCurrentUser(user);

    if (user) {
      setCorreo(user.email);
      fetchUserProfile(user.uid);
    }

    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder a la galería de imágenes.');
      }
    })();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setNombre(userData.nombre);
        setTelefono(userData.telefono);
        setImage(userData.image);
      }
      setInitializing(false);
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      setInitializing(false);
    }
  };

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

  const handleUpdateProfile = async () => {
    if (!nombre || !telefono) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      let imageUrl = image;

      if (image && image.startsWith('file')) {
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

      await setDoc(doc(db, 'users', currentUser.uid), {
        nombre,
        telefono,
        image: imageUrl,
        email: currentUser.email
      });

      setLoading(false);
      alert('Perfil actualizado con éxito!');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setLoading(false);
      alert('Hubo un error al actualizar el perfil: ' + error.message);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#143d5c" />
      </View>
    );
  }

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
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        editable={false} // El correo no es editable
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Actualizar Perfil</Text>
        )}
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
  updateButton: {
    backgroundColor: '#143d5c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PerfilScreen;
