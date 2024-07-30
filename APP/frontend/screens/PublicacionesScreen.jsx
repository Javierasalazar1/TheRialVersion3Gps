import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FilterModal from './componentes/ModalFiltro';


const PAGE_SIZE = 10;
const screenWidth = Dimensions.get('window').width;

const PublicacionesScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showReportError, setShowReportError] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  //MIOOOO
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({ category: 'Todas las categorias', date: 'anytime' });

  const categories = [
    { label: 'Noticias', value: 'Noticias' },
    { label: 'Otros', value: 'otros' }
  ];

  useEffect(() => {
    fetchPublicaciones();
  }, []);
  useEffect(() => {
    filterPublicaciones();
  }, [searchTerm, publicaciones, filter]);
  
  const fetchPublicaciones = async () => {
    try {
      const db = getFirestore();
      const publicacionesCollection = collection(db, 'publicaciones');
      const publicacionesQuery = query(publicacionesCollection, orderBy('fecha', 'desc'), limit(PAGE_SIZE));
      const publicacionesSnapshot = await getDocs(publicacionesQuery);
  
      const publicacionesList = publicacionesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        // Asegúrate de que el campo username exista en el documento de publicación
        return {
          id: docSnapshot.id,
          ...data,
          userName: data.username || 'Usuario desconocido', // Usa el campo username del documento
        };
      });
  
      setPublicaciones(publicacionesList);
      setFilteredPublicaciones(publicacionesList);
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener publicaciones:", error);
      setError("Hubo un error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMorePublicaciones = async () => {
    if (!lastVisible || loadingMore) return;
  
    setLoadingMore(true);
    try {
      const db = getFirestore();
      const publicacionesCollection = collection(db, 'publicaciones');
      const publicacionesQuery = query(
        publicacionesCollection,
        orderBy('fecha', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );
      const publicacionesSnapshot = await getDocs(publicacionesQuery);
  
      const publicacionesList = publicacionesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        // Asegúrate de que el campo username exista en el documento de publicación
        return {
          id: docSnapshot.id,
          ...data,
          userName: data.username || 'Usuario desconocido' // Usa el campo username del documento
        };
      });
  
      setPublicaciones(prevPublicaciones => [...prevPublicaciones, ...publicacionesList]);
      setFilteredPublicaciones(prevPublicaciones => [...prevPublicaciones, ...publicacionesList]);
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener más publicaciones:", error);
      setError("Hubo un error al cargar más publicaciones. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoadingMore(false);
    }
  };

//NOLOBORREN
  const filterPublicaciones = () => {
    let filtered = publicaciones;

    if (searchTerm !== '') {
      const termLower = searchTerm.toLowerCase();
      filtered = filtered.filter(pub => {
        const title = pub.nombre?.toLowerCase() || '';
        const detail = pub.detalle?.toLowerCase() || '';
        return title.includes(termLower) || detail.includes(termLower);
      });
    }

    if (filter.category && filter.category !== 'Todas las categorias') {
      filtered = filtered.filter(pub => pub.categoria === filter.category);
    }

    if (filter.date !== 'anytime') {
      const now = new Date();
      let dateLimit;

      switch (filter.date) {
        case 'today':
          dateLimit = new Date(now.getTime() - (24 * 60 * 60 * 1000));
          break;
        case 'thisWeek':
          dateLimit = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case 'thisMonth':
          dateLimit = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case 'thisYear':
          dateLimit = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
          break;
        default:
          dateLimit = new Date(0);
      }

      filtered = filtered.filter(pub => new Date(pub.fecha) >= dateLimit);
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

  const handleReport = async () => {
    if (!selectedReason) {
      setShowReportError(true);
      return;
    }

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'reports'), {
        reason: selectedReason,
        additionalInfo,
        timestamp: new Date(),
        publicationId: selectedPublication,
      });

      Toast.show({
        type: 'success',
        text1: 'Reporte enviado con éxito',
      });

      setSelectedReason('');
      setAdditionalInfo('');
      setModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al enviar el reporte',
        text2: error.message,
      });
    }
  };

  const openReportModal = (publicationId) => {
    setSelectedPublication(publicationId);
    setModalVisible(true);
  };

  const openEditModal = (publication) => {
    setEditingPublication(publication);
    setEditModalVisible(true);
    setOptionsModalVisible(false);
  };

  const handleEdit = async () => {
    try {
      const db = getFirestore();
      const publicationRef = doc(db, 'publicaciones', editingPublication.id);
      await updateDoc(publicationRef, {
        nombre: editingPublication.nombre,
        detalle: editingPublication.detalle,
        categoria: editingPublication.categoria,
      });

      Toast.show({
        type: 'success',
        text1: 'Publicación actualizada con éxito',
      });

      setEditModalVisible(false);
      fetchPublicaciones();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar la publicación',
        text2: error.message,
      });
    }
  };

  const handleDelete = async (publicationId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'publicaciones', publicationId));

      Toast.show({
        type: 'success',
        text1: 'Publicación eliminada con éxito',
      });

      setPublicaciones(prevPublicaciones => prevPublicaciones.filter(pub => pub.id !== publicationId));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al eliminar la publicación',
        text2: error.message,
      });
    }
    setOptionsModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemText}>
          <Text style={styles.userName}> {item.userName}</Text>
          {item.imagen && <Image source={{ uri: item.imagen }} style={styles.image} onError={(e) => console.log('Error al cargar la imagen:', e.nativeEvent.error)} />}
          <Text style={styles.title}>{item.nombre}</Text>
          <Text style={styles.detail}>{item.detalle}</Text>
          <Text style={styles.category}>{item.categoria}</Text>
          <Text style={styles.date}>{item.fecha}</Text> {/* Muestra la fecha formateada */}
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => openReportModal(item.id)} style={styles.iconButton}>
            <Ionicons name="flag-outline" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setSelectedPublication(item);
            setOptionsModalVisible(true);
          }} style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
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
        data={filteredPublicaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchMorePublicaciones}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
        contentContainerStyle={styles.flatlistContent}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reportar Publicación</Text>
            
            <View style={styles.reportContainer}>
              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reportReasonBox,
                    selectedReason === reason && { backgroundColor: '#007BFF' }
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text style={[
                    styles.reportReasonText,
                    selectedReason === reason && { color: 'white' }
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reportInput}
              multiline
              placeholder="Información adicional (opcional)"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
            />
            {showReportError && (
              <Text style={styles.errorText}>Selecciona un motivo antes de enviar el reporte.</Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                <Text style={styles.reportButtonText}>Reportar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Publicación</Text>
            
            <TextInput
              style={styles.input}
              value={editingPublication?.nombre}
              onChangeText={(text) => setEditingPublication({...editingPublication, nombre: text})}
              placeholder="Nombre"
            />
            <TextInput
              style={styles.input}
              value={editingPublication?.detalle}
              onChangeText={(text) => setEditingPublication({...editingPublication, detalle: text})}
              placeholder="Detalle"
              multiline
            />
            <TextInput
              style={styles.input}
              value={editingPublication?.categoria}
              onChangeText={(text) => setEditingPublication({...editingPublication, categoria: text})}
              placeholder="Categoría"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => openEditModal(selectedPublication)}>
              <Text style={styles.optionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleDelete(selectedPublication.id)}>
              <Text style={styles.optionButtonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setOptionsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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

  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemContent: {
    flexDirection: 'column',
  },
  itemText: {
    flex: 1,
  },
  image: {
    width: screenWidth - 20,
    height: screenWidth - 20,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  category: {
    fontSize: 14,
    color: '#007BFF',
  },
  flatlistContent: {
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  iconButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  reportContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  reportReasonBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  reportReasonText: {
    color: 'black',
  },
  reportInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
  },
  reportButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  reportButtonText: {
    color: 'white',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  optionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default PublicacionesScreen;