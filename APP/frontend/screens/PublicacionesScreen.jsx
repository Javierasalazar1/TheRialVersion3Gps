import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FilterModal from './componentes/ModalFiltro';

const PAGE_SIZE = 10;

const PublicacionesScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showReportError, setShowReportError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({ category: 'Todas las categorias', date: 'anytime' });

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

      const publicacionesList = await Promise.all(publicacionesSnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          userName: data.username || 'Usuario desconocido',
        };
      }));

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

      const publicacionesList = await Promise.all(publicacionesSnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.userId) {
          console.warn(`La publicación ${docSnapshot.id} no tiene userId`);
          return {
            id: docSnapshot.id,
            ...data,
            userEmail: 'Usuario desconocido'
          };
        }
        try {
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnapshot = await getDoc(userDocRef);
          const userData = userDocSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            userEmail: userData ? userData.email : 'Usuario desconocido'
          };
        } catch (userError) {
          console.error(`Error al obtener datos del usuario para la publicación ${docSnapshot.id}:`, userError);
          return {
            id: docSnapshot.id,
            ...data,
            userEmail: 'Error al obtener usuario'
          };
        }
      }));

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

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemText}>
          <Text style={styles.userName}> {item.userName}</Text>
          {item.imagen && <Image source={{ uri: item.imagen }} style={styles.image} onError={(e) => console.log('Error al cargar la imagen:', e.nativeEvent.error)} />}
          <Text style={styles.title}>{item.nombre}</Text>
          <Text style={styles.detail}>{item.detalle}</Text>
          <Text style={styles.category}>{item.categoria}</Text>
          <Text style={styles.date}>{item.fecha}</Text>
        </View>
        <TouchableOpacity onPress={() => openReportModal(item.id)} style={styles.flagIcon}>
          <Ionicons name="flag-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#143d5c" />
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
        ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#143d5c" />}
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
              <TouchableOpacity style={styles.acceptButton} onPress={handleReport}>
                <Text style={styles.acceptButtonText}>Enviar Reporte</Text>
              </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
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
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 16,
    marginTop: 5,
  },
  category: {
    fontSize: 14,
    marginTop: 5,
    color: 'gray',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  flatlistContent: {
    paddingBottom: 50,
  },
  flagIcon: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reportContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reportReasonBox: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  reportReasonText: {
    fontSize: 16,
  },
  reportInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    height: 100,
    width: '80%',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '40%',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '40%',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PublicacionesScreen;
