import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadFileToStorage } from '../firebasestorage';
import { getAuth } from 'firebase/auth';

console.log('uploadFileToStorage:', uploadFileToStorage);

const CrearMercado = () => {
  const [image, setImage] = useState(null);
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);

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
    if (!nombre || !detalle || !categoria) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (!currentUser) {
      alert('Debes estar autenticado para crear una publicación.');
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
  
      const docRef = await addDoc(collection(db, 'Mercado'), {
        nombre,
        detalle,
        categoria,
        estado,
        precio,
        fecha: new Date().toISOString(),
        imagen: imageUrl,
        userId: currentUser.uid,
      });
  
      console.log('Documento agregado con ID: ', docRef.id);
  
      setImage(null);
      setNombre('');
      setDetalle('');
      setCategoria('');
      setPrecio('');
      setEstado('');
      setLoading(false);
      alert('Publicación exitosa!');
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
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Detalle"
        value={detalle}
        onChangeText={setDetalle}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
      />
        <TextInput
        style={styles.input}
        placeholder="Estado de venta"
        value={estado}
        onChangeText={setEstado}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
        <Text style={styles.uploadButtonText}>Subir Publicación</Text>
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

export default CrearMercado;