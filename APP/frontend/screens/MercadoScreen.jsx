import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

const PAGE_SIZE = 10;

const MercadoScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportError, setShowReportError] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ nombre: '', detalle: '', imagen: '' });
  
  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      const db = getFirestore();
      const publicacionesCollection = collection(db, 'Mercado');
      const publicacionesQuery = query(publicacionesCollection, orderBy('fecha', 'desc'), limit(PAGE_SIZE));
      const publicacionesSnapshot = await getDocs(publicacionesQuery);

      const publicacionesList = publicacionesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const fecha = data.fecha && typeof data.fecha.toDate === 'function'
          ? data.fecha.toDate().toLocaleDateString()
          : 'Fecha desconocida';
        return {
          id: docSnapshot.id,
          ...data,
          fecha,
          nombre: data.nombre || 'Usuario desconocido',
        };
      });

      setPublicaciones(publicacionesList);
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
        const fecha = data.fecha && typeof data.fecha.toDate === 'function'
          ? data.fecha.toDate().toLocaleDateString()
          : 'Fecha desconocida';
        return {
          id: docSnapshot.id,
          ...data,
          fecha,
          nombre: data.nombre || 'Usuario desconocido',
        };
      });

      setPublicaciones(prev => [...prev, ...publicacionesList]);
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching more publicaciones:', error);
      setError('Error fetching more publicaciones: ' + error.message);
      setLoadingMore(false);
    }
  };

  const handleEditPost = (postId) => {
    const post = publicaciones.find(pub => pub.id === postId);
    if (post) {
      setEditData({ nombre: post.nombre, detalle: post.detalle, imagen: post.imagen });
      setSelectedItemId(postId);
      setEditModalVisible(true);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const db = getFirestore();
      const postRef = doc(db, 'Mercado', selectedItemId);
      await updateDoc(postRef, {
        nombre: editData.nombre,
        detalle: editData.detalle,
        imagen: editData.imagen
      });
      Alert.alert('Publicación actualizada', 'La publicación ha sido actualizada con éxito.');
      fetchPublicaciones();
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error actualizando publicación:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar la publicación.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'Mercado', postId));
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

  const handleOpenOptions = (itemId) => {
    setSelectedItemId(itemId);
    setOptionsModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEditData({ ...editData, imagen: result.uri });
    }
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
            <Ionicons name="ellipsis-vertical" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.ima}>
        <Image source={{ uri: item.imagen }} style={styles.image} />
      </View>
      <Text style={styles.title}>{item.nombre}</Text>
      <View style={styles.footer}>
        <Text style={styles.userEmail}>{item.detalle}</Text>
        <Text style={styles.date}>{item.fecha}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Cargando publicaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={publicaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchMorePublicaciones}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
      />

      {/* Modal para opciones de editar y eliminar */}
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

      {/* Modal para editar publicación */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Publicación</Text>
            <TextInput
              style={styles.input}
              value={editData.nombre}
              onChangeText={text => setEditData({ ...editData, nombre: text })}
              placeholder="Nombre"
            />
            <TextInput
              style={styles.input}
              value={editData.detalle}
              onChangeText={text => setEditData({ ...editData, detalle: text })}
              placeholder="Detalle"
              multiline
            />
            <View style={styles.imagePicker}>
              <Button title="Subir Nueva Imagen" onPress={pickImage} />
              {editData.imagen ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: editData.imagen }} style={styles.previewImage} />
                  <Button title="Borrar Imagen" onPress={() => setEditData({ ...editData, imagen: '' })} color="red" />
                </View>
              ) : null}
            </View>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setEditModalVisible(false)} color="red" />
              <Button title="Actualizar" onPress={handleUpdatePost} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal existente para reportar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
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
              <Button title="Cancelar" onPress={handleCloseModal} color="red" />
              <Button title="Enviar" onPress={handleReportSubmit} />
            </View>
          </View>
        </View>
      </Modal>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
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
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ima: {
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
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  reportIcon: {
    marginLeft: 10,
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
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
    color: '#007BFF',
    backgroundColor: '#e0e0e0',
  },
  selectedReportOptionText: {
    color: '#007BFF',
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
  imagePicker: {
    marginBottom: 20,
  },
  imagePreview: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default MercadoScreen;
