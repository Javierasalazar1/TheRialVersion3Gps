import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, Button, Picker } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import ModalFiltro from './componentes/ModalFiltro';

const PAGE_SIZE = 10;

const reportReasons = [
  "Contenido inapropiado",
  "Spam",
  "Fraude",
  "Incitación al odio",
  "Información falsa",
  "Contenido sexual",
  "Acoso",
  "Otro"
];

const categories = [
  { label: 'Libros y Materiales de Estudio', value: 'Libros y Materiales de Estudio' },
  { label: 'Electrónica y Accesorios', value: 'Electrónica y Accesorios' },
  { label: 'Ropa y Accesorios', value: 'Ropa y Accesorios' },
  { label: 'Hogar y Dormitorio', value: 'Hogar y Dormitorio' },
  { label: 'Deportes y Actividades al Aire Libre', value: 'Deportes y Actividades al Aire Libre' },
  { label: 'Transporte', value: 'Transporte' },
  { label: 'Entretenimiento y Ocio', value: 'Entretenimiento y Ocio' },
  { label: 'Salud y Belleza', value: 'Salud y Belleza' },
  { label: 'Servicios', value: 'Servicios' },
];

const states = [
  { label: 'Activo', value: 'activo' },
  { label: 'Pausado', value: 'pausado' },
  { label: 'Sin stock', value: 'sin_stock' }
];

const MercadoScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportError, setShowReportError] = useState(false);
  const [username, setUsername] = useState('');
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedPost, setEditedPost] = useState({ id: '', nombre: '', detalle: '', imagen: '', categoria: '', precio: '', estadoVenta: 'activo' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({ category: 'Todas las categorias', date: 'anytime' });

  useEffect(() => {
    fetchPublicaciones();
    fetchUsername();
  }, []);

  useEffect(() => {
    filterPublicaciones();
  }, [searchText, publicaciones, filter]);

  const fetchUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(JSON.parse(storedUsername));
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const fetchPublicaciones = async () => {
    try {
      const db = getFirestore();
      const publicacionesCollection = collection(db, 'Mercado');
      const publicacionesQuery = query(publicacionesCollection, orderBy('fecha', 'desc'), limit(PAGE_SIZE));
      const publicacionesSnapshot = await getDocs(publicacionesQuery);

      const publicacionesList = publicacionesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          fecha: data.fecha,
          nombre: data.nombre || 'Usuario desconocido',
        };
      });

      setPublicaciones(publicacionesList);
      setFilteredPublicaciones(publicacionesList);
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching publicaciones:', error);
      setError('Error fetching publicaciones: ' + error.message);
      setLoading(false);
    }
  };

  const fetchMorePublicaciones = async () => {
    if (!lastVisible || loadingMore) return;

    setLoadingMore(true);
    try {
      const db = getFirestore();
      const publicacionesCollection = collection(db, 'Mercado');
      const publicacionesQuery = query(
        publicacionesCollection,
        orderBy('fecha', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );
      const publicacionesSnapshot = await getDocs(publicacionesQuery);

      const publicacionesList = publicacionesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          fecha: data.fecha,
          nombre: data.nombre || 'Usuario desconocido',
        };
      });

      setPublicaciones(prev => [...prev, ...publicacionesList]);
      setFilteredPublicaciones(prev => [...prev, ...publicacionesList]);
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching more publicaciones:', error);
      setError('Error fetching more publicaciones: ' + error.message);
      setLoadingMore(false);
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = publicaciones.find(post => post.id === postId);
    if (postToEdit) {
      setEditedPost({
        id: postToEdit.id,
        nombre: postToEdit.nombre,
        detalle: postToEdit.detalle,
        imagen: postToEdit.imagen || '',
        categoria: postToEdit.categoria || '',
        precio: postToEdit.precio || '',
        estadoVenta: postToEdit.estadoVenta || 'activo'
      });
      setEditModalVisible(true);
      setImageDeleted(false);
      setSelectedImage(null);
    }
    setOptionsModalVisible(false);
  };

  const handleUpdatePost = async () => {
    try {
      const db = getFirestore();
      const postRef = doc(db, 'Mercado', editedPost.id);

      let imageUrl = editedPost.imagen;
      if (selectedImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `images/${Date.now()}_${selectedImage.uri.split('/').pop()}`);
        const img = await fetch(selectedImage.uri);
        const bytes = await img.blob();

        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);

        if (editedPost.imagen) {
          const oldImageRef = ref(storage, editedPost.imagen);
          await deleteObject(oldImageRef);
        }
      } else if (imageDeleted) {
        if (editedPost.imagen) {
          const storage = getStorage();
          const oldImageRef = ref(storage, editedPost.imagen);
          await deleteObject(oldImageRef);
        }
        imageUrl = '';
      }

      await updateDoc(postRef, {
        nombre: editedPost.nombre,
        detalle: editedPost.detalle,
        imagen: imageUrl,
        categoria: editedPost.categoria,
        precio: editedPost.precio,
        estadoVenta: editedPost.estadoVenta
      });

      Alert.alert('Publicación actualizada', 'La publicación ha sido actualizada con éxito.');
      setEditModalVisible(false);
      setSelectedImage(null);
      fetchPublicaciones(); // Refresh the posts
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar la publicación.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const db = getFirestore();
      const postRef = doc(db, 'Mercado', postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        if (postData.imagen) {
          const storage = getStorage();
          const imageRef = ref(storage, postData.imagen);
          await deleteObject(imageRef);
        }
      }

      await deleteDoc(postRef);
      Alert.alert('Publicación eliminada', 'La publicación ha sido eliminada con éxito.');
      fetchPublicaciones();
    } catch (error) {
      console.error('Error eliminando publicación:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar la publicación.');
    }
  };

  const handleReportItem = (itemId) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItemId(null);
    setReportReason('');
    setShowReportError(false);
    setReportDetails('');
  };

  const handleReportSubmit = () => {
    if (!reportReason) {
      setShowReportError(true);
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Reporte enviado',
      text2: 'Tu reporte ha sido enviado con éxito.'
    });

    handleCloseModal();
  };

  const formatFecha = (fecha) => {
    const day = ("0" + fecha.getDate()).slice(-2);
    const month = ("0" + (fecha.getMonth() + 1)).slice(-2);
    const year = fecha.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleOpenOptions = (itemId) => {
    setSelectedItemId(itemId);
    setOptionsModalVisible(true);
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setImageDeleted(false);
    }
  };

  const filterPublicaciones = () => {
    let filtered = publicaciones;

    if (searchText !== '') {
      const termLower = searchText.toLowerCase();
      filtered = filtered.filter(post => {
        const nombre = post.nombre?.toLowerCase() || '';
        const detalle = post.detalle?.toLowerCase() || '';
        return nombre.includes(termLower) || detalle.includes(termLower);
      });
    }

    if (filter.category && filter.category !== 'Todas las categorias') {
      filtered = filtered.filter(post => post.categoria === filter.category);
    }

    if (filter.date !== 'anytime') {
      const now = new Date();
      let dateLimit;

      switch (filter.date) {
        case 'today':
          dateLimit = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'thisWeek':
          dateLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'thisMonth':
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'thisYear':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateLimit = new Date(0);
      }

      filtered = filtered.filter(post => new Date(post.fecha) >= dateLimit);
    }

    setFilteredPublicaciones(filtered);
  };

  const resetFilters = () => {
    setFilter({ category: 'Todas las categorias', date: 'anytime' });
    setShowFilters(false);
  };

  const handleFilterSelect = (type, value) => {
    setFilter({ ...filter, [type]: value });
  };

  const applyFilters = () => {
    filterPublicaciones();
    setShowFilters(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.usuario}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => handleReportItem(item.id)}>
            <Ionicons name="flag-outline" size={24} color="red" style={styles.reportIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleOpenOptions(item.id)}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.detalle}>{item.detalle}</Text>
      <View style={styles.footer}>
        <Text style={styles.precio}>${item.precio}</Text>
        <Text style={styles.fecha}>{formatFecha(new Date(item.fecha))}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator size="large" color="#0000ff" />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <MenuProvider>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={18} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <FontAwesome5 name="filter" size={18} color="black" />
        </TouchableOpacity>
      </View>
      
      <ModalFiltro
        visible={showFilters}
        onClose={resetFilters}
        filter={filter}
        handleFilterSelect={handleFilterSelect}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
        categories={categories}
      />

      <FlatList
        data={filteredPublicaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchMorePublicaciones}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar publicación</Text>
            <View style={styles.reasonsContainer}>
              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setReportReason(reason)}
                  style={[
                    styles.reportOption,
                    reportReason === reason ? styles.selectedReportOption : null
                  ]}
                >
                  <Text style={[styles.reportOptionText, reportReason === reason ? styles.selectedReportOptionText : null]}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={reportDetails}
              onChangeText={text => setReportDetails(text)}
              placeholder="Detalles adicionales (opcional)"
              multiline
            />
            {showReportError && (
              <Text style={styles.errorText}>Selecciona un motivo antes de enviar el reporte.</Text>
            )}
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={handleCloseModal} color="#ef8016" />
              <Button title="Reportar" onPress={handleReportSubmit} color="#143d5c"/>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar publicación</Text>
            <TextInput
              style={styles.input}
              value={editedPost.nombre}
              onChangeText={(text) => setEditedPost({ ...editedPost, nombre: text })}
              placeholder="Título"
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={editedPost.detalle}
              onChangeText={(text) => setEditedPost({ ...editedPost, detalle: text })}
              placeholder="Detalles"
              multiline
            />
            <Picker
              selectedValue={editedPost.categoria}
              onValueChange={(itemValue) => setEditedPost({ ...editedPost, categoria: itemValue })}
              style={styles.input}
            >
              {categories.map((category, index) => (
                <Picker.Item key={index} label={category.label} value={category.value} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              value={editedPost.precio}
              onChangeText={(text) => setEditedPost({ ...editedPost, precio: text })}
              placeholder="Precio"
              keyboardType="numeric"
            />
            <Picker
              selectedValue={editedPost.estadoVenta}
              onValueChange={(itemValue) => setEditedPost({ ...editedPost, estadoVenta: itemValue })}
              style={styles.input}
            >
              {states.map((state, index) => (
                <Picker.Item key={index} label={state.label} value={state.value} />
              ))}
            </Picker>
            <View style={styles.imagePickerContainer}>
              <Button title="Seleccionar Imagen" onPress={handleImagePicker} />
              {selectedImage && (
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
              )}
              {imageDeleted && (
                <Text style={styles.imageDeletedText}>Imagen será eliminada</Text>
              )}
              {!selectedImage && !imageDeleted && editedPost.imagen ? (
                <Image source={{ uri: editedPost.imagen }} style={styles.selectedImage} />
              ) : null}
            </View>
            <Button
              title="Eliminar Imagen"
              onPress={() => {
                setSelectedImage(null);
                setImageDeleted(true);
              }}
              color="red"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setEditModalVisible(false)} color="red" />
              <Button title="Guardar" onPress={handleUpdatePost} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContent}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                handleEditPost(selectedItemId);
                setOptionsModalVisible(false);
              }}
            >
              <Text style={styles.optionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                handleDeletePost(selectedItemId);
                setOptionsModalVisible(false);
              }}
            >
              <Text style={styles.optionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 5,
    margin: 10,
    padding: 10,
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    bottom: 30,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  filterButton: {
    marginLeft: 10,
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
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  detalle: {
    marginBottom: 5,
  },
  fecha: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  name: {
    fontWeight: 'bold',
  },
  precio: {
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 40,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'space-around',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reportOption: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  reportOptionText: {
    fontSize: 18,
  },
  selectedReportOption: {
    fontWeight: 'bold',
    color: '#143d5c',
    backgroundColor: '#ef8016',
  },
  selectedReportOptionText: {
    color: '#ffff',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  imagePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  imageDeletedText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MercadoScreen;
