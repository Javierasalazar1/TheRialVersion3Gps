import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MercadoScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null); // Estado para almacenar el ID del item seleccionado para reportar
  const [modalVisible, setModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportError, setShowReportError] = useState(false); // Nuevo estado para mostrar el error
  const [username, setUsername] = useState(''); // Estado para almacenar el nombre de usuario
  
  useEffect(() => {
    fetchPublicaciones();
    fetchUsername(); // Obtener el nombre de usuario al montar el componente
  }, []);

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
        const fecha = data.fecha
          ? formatFecha(new Date(data.fecha))
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
        const fecha = data.fecha
          ? formatFecha(new Date(data.fecha))
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
    // Implementa la funcionalidad de edición aquí
    console.log('Editar publicación con ID:', postId);
  };

  const handleDeletePost = async (postId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'Mercado', postId));
      Alert.alert('Publicación eliminada', 'La publicación ha sido eliminada con éxito.');
      fetchPublicaciones(); // Vuelve a cargar las publicaciones después de eliminar
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
    setShowReportError(false); // Reiniciar el estado de error al abrir el modal
    setReportDetails('');
  };

  const handleReportSubmit = () => {
    if (!reportReason) {
      setShowReportError(true); // Mostrar mensaje de error si no se ha seleccionado un motivo
      return;
    }

    // Envío del reporte simulado con un Toast para el feedback
    Toast.show({
      type: 'success',
      text1: 'Reporte enviado',
      text2: 'Tu reporte ha sido enviado con éxito.'
    });

    // Cerrar el modal y limpiar los estados
    handleCloseModal();
  };

  const formatFecha = (fecha) => {
    const day = ("0" + fecha.getDate()).slice(-2);
    const month = ("0" + (fecha.getMonth() + 1)).slice(-2);
    const year = fecha.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.usuario}</Text>
        <TouchableOpacity onPress={() => handleReportItem(item.id)}>
          <Ionicons name="flag-outline" size={24} color="red" style={styles.reportIcon} />
        </TouchableOpacity>
        <Menu>
          <MenuTrigger>
            <Ionicons name="ellipsis-vertical" size={22} color="black" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => handleEditPost(item.id)} text='Editar' />
            <MenuOption onSelect={() => handleDeletePost(item.id)} text='Eliminar' />
          </MenuOptions>
        </Menu>
      </View>
      <View style={styles.ima}>
        <Image source={{ uri: item.imagen }} style={styles.image} />
      </View>
      <Text style={styles.title}>{item.nombre}</Text>
      <View style={styles.header}>
        <Text style={styles.userEmail}>{item.detalle}</Text>
        <Text style={styles.date}>{item.fecha}</Text>
      </View>
    </View>
  );

  return (
    <MenuProvider>
      <View style={styles.container}>
        <FlatList
          data={publicaciones}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={fetchMorePublicaciones}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#143d5c" />}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {/* Modal de reporte */}
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
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
  ima: {
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: 'gray',
    minWidth:'100px',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
    maxWidth:'250px',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  modalLabel: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 100,
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
});

export default MercadoScreen;
