import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, ActivityIndicator, TextInput, Button } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { FontAwesome5 } from '@expo/vector-icons';
import FilterModal from './componentes/ModalFiltro';

const PAGE_SIZE = 10;

const AvisosScreen = () => {
  const [avisos, setAvisos] = useState([]);
  const [filteredAvisos, setFilteredAvisos] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Estado para mostrar el modal de filtros
  const [filter, setFilter] = useState({ order: 'mostLikes', category: 'deportes', date: 'anytime' }); // Estado de los filtros

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
    setFilter({ order: 'mostLikes', category: 'deportes', date: 'anytime' });
  };

  const handleFilterSelect = (type, value) => {
    setFilter({ ...filter, [type]: value });
  };
  const applyFilters = () => {
    // Implementa tu lógica de filtros aquí
    setShowFilters(false);
  };


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
    setShowReportError(false);
    setReportModalVisible(true);
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

    setReportModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handlePress(item)} style={styles.item}>
        <Text style={styles.title}>{item.titulo}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReportPress(item)} style={styles.reportIcon}>
        <Ionicons name="flag-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
      />

      {filteredAvisos.length > 0 ? (
        <FlatList
          data={filteredAvisos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={fetchMoreAvisos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
          contentContainerStyle={styles.flatlistContent}
        />
      ) : (
        <Text style={styles.noResultsText}>No se encontraron resultados</Text>
      )}
      {selectedAviso && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedAviso.imagen ? (
                <Image source={{ uri: selectedAviso.imagen }} style={styles.modalImage} />
              ) : null}
              <Text style={styles.modalTitle}>{selectedAviso.titulo}</Text>
              <Text style={styles.modalDetail}>{selectedAviso.contenido}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.reportModalContainer}>
          <View style={styles.reportModalContent}>
            <Text style={styles.reportTitle}>Reportar Aviso</Text>

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
                  <Text style={[
                    styles.reportOptionText,
                    reportReason === reason ? styles.selectedReportOptionText : null
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reportInput}
              placeholder="Detalles adicionales (opcional)"
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
            />
            {showReportError && (
              <Text style={styles.errorText}>Selecciona un motivo antes de enviar el reporte.</Text>
            )}
            <View style={styles.reportButtonContainer}>
              <Button title="Cancelar" color="red" onPress={() => setReportModalVisible(false)} />
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
  contentContainer: {
    flexGrow: 1,
    marginBottom: 10,
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  item: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportIcon: {
    paddingLeft: 10,
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
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalDetail: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#007BFF',
  },
  reportModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reportModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  reportInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 100,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  reportButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  text: {
    fontSize: 18,
  },
  noResultsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AvisosScreen;
