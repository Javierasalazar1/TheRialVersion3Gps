import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

const PAGE_SIZE = 10;

const AvisosScreen = () => {
  const [avisos, setAvisos] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAviso, setSelectedAviso] = useState(null);

  useEffect(() => {
    fetchAvisos();
  }, []);

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
      setLastVisible(avisosSnapshot.docs[avisosSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener avisos:", error);
      setError("Hubo un error al cargar los avisos. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.item}>
        <Text style={styles.title}>{item.titulo}</Text>
      </View>
    </TouchableOpacity>
  );

  const handlePress = (item) => {
    setSelectedAviso(item);
    setModalVisible(true);
  };

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
      <FlatList
        data={avisos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchMoreAvisos}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 50, // Ajusta este valor según el tamaño de tu barra de navegación en InicioScreen
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  flatlistContent: {
    paddingBottom: 50, // Ajusta este valor según el tamaño de tu barra de navegación en InicioScreen
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDetail: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#6a1b9a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AvisosScreen;
