import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Picker } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadFileToStorage } from '../firebasestorage'; // Asegúrate de tener esta función correctamente implementada

const CrearMercado = () => {
  const [image, setImage] = useState(null);
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([
    "Libros y Materiales de Estudio",
    "Electrónica y Accesorios",
    "Ropa y Accesorios",
    "Hogar y Dormitorio",
    "Deportes y Actividades al Aire Libre",
    "Transporte",
    "Entretenimiento y Ocio",
    "Salud y Belleza",
    "Servicios"
  ]);
  const [precio, setPrecio] = useState('');
  const [estado, setEstado] = useState(true); // Estado booleano
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState(''); // Estado para almacenar el nombre de usuario

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error al obtener el nombre de usuario:', error);
      }
    };

    fetchUsername();
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
        usuario: username, // Incluir el nombre de usuario
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
      setEstado(true);
      setLoading(false);
      alert('Publicación exitosa!');
    } catch (error) {
      console.error('Error al subir la publicación:', error);
      setLoading(false);
      alert('Hubo un error al subir la publicación: ' + error.message);
    }
  };

  const handlePrecioChange = (text) => {
    const precioNumerico = text.replace(/[^0-9]/g, '');
    if (precioNumerico.length <= 8) {
      setPrecio(precioNumerico);
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
        maxLength={40} // Limite de 40 caracteres
      />
      <TextInput
        style={styles.input}
        placeholder="Detalle"
        value={detalle}
        onChangeText={setDetalle}
        maxLength={300} // Limite de 300 caracteres
        multiline
      />
 
        <Picker
          style={styles.input}
          selectedValue={categoria}
          onValueChange={(itemValue, itemIndex) => setCategoria(itemValue)}
        >
          <Picker.Item label="Selecciona una categoría" value="" />
          {categorias.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={`$${precio}`}
        onChangeText={handlePrecioChange}
        keyboardType="numeric" // Solo aceptar números
      />
      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder="Estado de venta"
        value="Estado de venta: Activa"
        editable={false} // Campo deshabilitado
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
     backgroundColor: '#c9ced1',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#fcfeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 5,
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
    backgroundColor: '#fcfeff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#143d5c',
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
