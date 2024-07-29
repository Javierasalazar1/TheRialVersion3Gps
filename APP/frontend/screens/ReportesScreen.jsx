import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const ReportesScreen = () => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAviso, setSelectedAviso] = useState(null);

  useEffect(() => {
    fetchAvisosWithReports();
  }, []);

  const fetchAvisosWithReports = async () => {
    try {
      const db = getFirestore();
      const reportsCollection = collection(db, 'reportes');
      const reportsQuery = query(reportsCollection);
      const reportsSnapshot = await getDocs(reportsQuery);

      const avisoIds = new Set(
        reportsSnapshot.docs.map(docSnapshot => docSnapshot.data().avisoId)
      );

      const avisosPromises = Array.from(avisoIds).map(async (id) => {
        const avisoDoc = doc(db, 'avisos', id);
        const avisoSnapshot = await getDoc(avisoDoc);
        if (avisoSnapshot.exists()) {
          return { id: avisoSnapshot.id, ...avisoSnapshot.data() };
        }
        return null;
      });

      const avisosList = (await Promise.all(avisosPromises)).filter(aviso => aviso !== null);
      setAvisos(avisosList);
    } catch (error) {
      console.error("Error al obtener avisos con reportes:", error);
      setError("Hubo un error al cargar los avisos con reportes. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    setSelectedAviso(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handlePress(item)} style={styles.item}>
        <Text style={styles.title}>{item.titulo}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Cargando avisos con reportes...</Text>
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
  },
  itemContainer: {
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
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  text: {
    fontSize: 18,
  },
});

export default ReportesScreen;
