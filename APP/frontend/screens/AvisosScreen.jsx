

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, TextInput, Button, Image, Alert } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { FontAwesome5 } from '@expo/vector-icons';
import FilterModal from './componentes/ModalFiltro';

const PAGE_SIZE = 10;

const AvisosScreen = () => {
  const [avisos, setAvisos] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAviso, setSelectedAviso] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const [showReportError, setShowReportError] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [dropdownMenuVisible, setDropdownMenuVisible] = useState(false);
  //mis filtros
  const [filteredAvisos, setFilteredAvisos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Estado para mostrar el modal de filtros
  const [filter, setFilter] = useState({category: 'Todas las categorias', date: 'anytime' }); // Estado de los filtros




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

   // Define las categorías aquí
   const categories = [
    { label: 'Perdida de objeto', value: 'Perdida de objeto' },
    { label: 'Juegos', value: 'juegos' },
    { label: 'Búsqueda', value: 'busqueda' },
    { label: 'queque', value: 'queque' }
  ];


  useEffect(() => {
    fetchAvisos();
  }, []);

  useEffect(() => {
    filterAvisos();
  }, [searchTerm, avisos]);



  const fetchAvisos = async () => {
    try {
      const db = getFirestore();
      const avisosCollection = collection(db, 'avisos');
      const avisosQuery = query(avisosCollection, orderBy('fecha', 'desc'), limit(PAGE_SIZE));
      const avisosSnapshot = await getDocs(avisosQuery);

      const avisosList = avisosSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      setAvisos(avisosList);
      setFilteredAvisos(avisosList);
      setLastVisible(avisosSnapshot.docs[avisosSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener avisos:", error);
      setError("Hubo un error al cargar los avisos. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };
//Mis filtros
  const filterAvisos = () => {
    if (searchTerm === '') {
      setFilteredAvisos(avisos);
    } else {
      const termLower = searchTerm.toLowerCase();
      const filtered = avisos.filter(aviso => {
        const titulo = aviso.titulo?.toLowerCase() || '';
        const contenido = aviso.contenido?.toLowerCase() || '';
        return titulo.includes(termLower) || contenido.includes(termLower);
      });
      setFilteredAvisos(filtered);
    }
  };

  const resetFilters = () => {
    setFilter({category: 'Todas las categorias', date: 'anytime' });
    setShowFilters(false);
    };

  const handleFilterSelect = (type, value) => {
    setFilter({ ...filter, [type]: value });
  };
  const applyFilters = () => {
    // Implementa tu lógica de filtros aquí
    setShowFilters(false);
  };

//hasta aqui


  const fetchMoreAvisos = async () => {
    if (!lastVisible || loadingMore) return;

    setLoadingMore(true);
    try {
      const db = getFirestore();
      const avisosCollection = collection(db, 'avisos');
      const avisosQuery = query(
        avisosCollection,
        orderBy('fecha', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );
      const avisosSnapshot = await getDocs(avisosQuery);

      const avisosList = avisosSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      setAvisos(prevAvisos => [...prevAvisos, ...avisosList]);
      setLastVisible(avisosSnapshot.docs[avisosSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener más avisos:", error);
      setError("Hubo un error al cargar más avisos. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePress = (item) => {
    setSelectedAviso(item);
    setModalVisible(true);
  };

  const handleReportPress = (item) => {
    setSelectedAviso(item);
    setReportReason("");
    setReportDetails("");
    setShowReportError(false); // Reiniciar el estado de error al abrir el modal
    setReportModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      setShowReportError(true);
      return;
    }

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'reportes'), {
        reason: reportReason,
        additionalInfo: reportDetails,
        timestamp: new Date(),
        avisoId: selectedAviso.id,
      });

     setReportModalVisible(false); // Cerrar el modal primero

      Toast.show({
        type: 'success',
        text1: 'Reporte enviado',
        text2: 'Tu reporte ha sido enviado con éxito.',
      });

      setReportReason('');
      setReportDetails('');
    } catch (error) {
      setReportModalVisible(false);
      console.error('Error enviando el reporte:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hubo un problema al enviar el reporte.',
      });
    }
  };

  const handleDelete = async (item) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'avisos', item.id));

      setAvisos(prevAvisos => prevAvisos.filter(aviso => aviso.id !== item.id));
      Toast.show({
        type: 'success',
        text1: 'Aviso eliminado',
        text2: 'El aviso ha sido eliminado con éxito.'
      });
    } catch (error) {
      console.error("Error al eliminar el aviso:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hubo un error al eliminar el aviso. Por favor, intenta de nuevo más tarde.'
      });
    }
  };

  const handleEdit = (item) => {
    setSelectedAviso(item);
    setEditTitle(item.titulo);
    setEditContent(item.contenido);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'avisos', selectedAviso.id), {
        titulo: editTitle,
        contenido: editContent
      });

      setAvisos(prevAvisos => prevAvisos.map(aviso => aviso.id === selectedAviso.id ? { ...aviso, titulo: editTitle, contenido: editContent } : aviso));
      setEditModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Aviso actualizado',
        text2: 'El aviso ha sido actualizado con éxito.'
      });
    } catch (error) {
      console.error("Error al actualizar el aviso:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hubo un error al actualizar el aviso. Por favor, intenta de nuevo más tarde.'
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handlePress(item)} style={styles.item}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>
      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={() => handleReportPress(item)} style={styles.iconButton}>
          <Ionicons name="flag-outline" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDropdownMenuVisible(!dropdownMenuVisible)} style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
        {dropdownMenuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.dropdownItem}>
              <Ionicons name="pencil" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.dropdownItem}>
              <Ionicons name="trash" size={20} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#143d5c" />
        <Text style={styles.text}>Cargando avisos...</Text>
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
        <View style={styles.searchContainer}>
       <FontAwesome5 name="search" size={18} color="black" />
      <TextInput
        style={styles.searchInput}
        placeholder=" Buscar..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
       <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <FontAwesome5 name="filter" size={18} color="black" />
          </TouchableOpacity>
      </View>
      
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filter={filter}
        handleFilterSelect={handleFilterSelect}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
        categories={categories} // Pasa las categorías como prop
      />

      <FlatList
        data={filteredAvisos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchMoreAvisos}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#143d5c" />}
        contentContainerStyle={styles.flatlistContent}
      />
      {selectedAviso && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedAviso.titulo}</Text>
              {selectedAviso.imagen && (
                <Image source={{ uri: selectedAviso.imagen }} style={styles.modalImage} />
              )}
              <Text style={styles.modalText}>{selectedAviso.contenido}</Text>
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Aviso</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título"
            />
            <TextInput
              style={styles.input}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Contenido"
              multiline
            />
            <Button title="Guardar" onPress={handleEditSubmit} />
            <Button title="Cancelar" onPress={() => setEditModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar Aviso</Text>
            <TextInput
              style={styles.input}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Razón del reporte"
            />
            {showReportError && !reportReason && (
              <Text style={styles.errorText}>Por favor, selecciona una razón para el reporte.</Text>
            )}


            <TextInput
              style={styles.input}
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="Detalles adicionales"
              multiline
            />

            <Button title="Enviar" onPress={handleReportSubmit} />
            <Button title="Cancelar" onPress={() => setReportModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#fff',
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


  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  item: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#555',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

export default AvisosScreen;
