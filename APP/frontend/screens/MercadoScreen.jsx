import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadFileToStorage } from '../firebasestorage';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const MercadoScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [categoria, setCategoria] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);

    const fetchPublicaciones = async () => {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'publicaciones'));
        const publicacionesData = [];
        querySnapshot.forEach((doc) => {
          publicacionesData.push({ id: doc.id, ...doc.data() });
        });
        setPublicaciones(publicacionesData);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();

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
  
    setUploading(true);
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
  
      const docRef = await addDoc(collection(db, 'publicaciones'), {
        nombre,
        detalle,
        categoria,
        fecha: new Date().toISOString(),
        like: 0,
        imagen: imageUrl,
        userId: currentUser.uid,
      });
  
      console.log('Documento agregado con ID: ', docRef.id);
  
      // Clear inputs after successful upload
      setImage(null);
      setNombre('');
      setDetalle('');
      setCategoria('');
      setUploading(false);
      alert('Publicación exitosa!');
      
      // Refresh the publicaciones list
      const querySnapshot = await getDocs(collection(db, 'publicaciones'));
      const publicacionesData = [];
      querySnapshot.forEach((doc) => {
        publicacionesData.push({ id: doc.id, ...doc.data() });
      });
      setPublicaciones(publicacionesData);

      // Hide the form after uploading
      setShowForm(false);

    } catch (error) {
      console.error('Error al subir la publicación:', error);
      setUploading(false);
      alert('Hubo un error al subir la publicación: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showForm && (
        <ScrollView contentContainerStyle={styles.formContainer}>
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
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
            <Text style={styles.uploadButtonText}>Subir Publicación</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {!showForm && (
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imagen && <Image source={{ uri: item.imagen }} style={styles.cardImage} />}
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <Text style={styles.cardDetalle}>{item.detalle}</Text>
              <Text style={styles.cardCategoria}>Categoría: {item.categoria}</Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(!showForm)}>
        <Ionicons name={showForm ? "close" : "add"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
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
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardNombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetalle: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardCategoria: {
    fontSize: 14,
    color: 'gray',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#6a1b9a',
    borderRadius: 30,
    elevation: 8,
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ima: {
    flexDirection: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: 'gray',
    },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 16,
    marginTop: 5,
  },
  image: {
    width: '50%',
    height: 100, // Tamaño fijo más pequeño
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default MercadoScreen;
