import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, TextInput, Button, Image, Alert } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

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
  const [editCategory, setEditCategory] = useState("");
  const [dropdownMenuVisible, setDropdownMenuVisible] = useState({}); // Usar un objeto para manejar visibilidad por ID

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
    setEditCategory(item.categoria); // Corregido para que coincida con el campo en la base de datos
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'avisos', selectedAviso.id), {
        titulo: editTitle,
        contenido: editContent,
        categoria: editCategory // Corregido para que coincida con el campo en la base de datos
      });

      setAvisos(prevAvisos => prevAvisos.map(aviso => aviso.id === selectedAviso.id ? { ...aviso, titulo: editTitle, contenido: editContent, categoria: editCategory } : aviso));
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
        <Text style={styles.category}>{item.categoria}</Text> {/* Corregido para que coincida con el campo en la base de datos */}
      </TouchableOpacity>
      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={() => handleReportPress(item)} style={styles.iconButton}>
          <Ionicons name="flag-outline" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDropdownMenuVisible(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
        {dropdownMenuVisible[item.id] && (
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

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={avisos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatlistContent}
          onEndReached={fetchMoreAvisos}
          onEndReachedThreshold={0.1}
        />
      )}

      {/* Modales */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedAviso?.titulo}</Text>
            <Text style={styles.modalText}>{selectedAviso?.contenido}</Text>
            {/* Mostrar imagen si hay */}
            {selectedAviso?.imagen && <Image source={{ uri: selectedAviso.imagen }} style={styles.modalImage} />}
            <Text style={styles.modalCategory}>{selectedAviso?.categoria}</Text>
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={reportModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar Aviso</Text>
            <Text style={styles.modalSubtitle}>Selecciona una razón:</Text>
            {reportReasons.map(reason => (
              <TouchableOpacity key={reason} onPress={() => setReportReason(reason)} style={styles.radioButton}>
                <Text style={styles.radioButtonLabel}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              placeholder="Detalles adicionales (opcional)"
              value={reportDetails}
              onChangeText={setReportDetails}
              style={styles.textInput}
            />
            {showReportError && <Text style={styles.errorText}>Por favor, selecciona una razón para el reporte.</Text>}
            <Button title="Enviar Reporte" onPress={handleReportSubmit} />
            <Button title="Cancelar" onPress={() => setReportModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Aviso</Text>
            <TextInput
              placeholder="Título"
              value={editTitle}
              onChangeText={setEditTitle}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Contenido"
              value={editContent}
              onChangeText={setEditContent}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Categoría"
              value={editCategory}
              onChangeText={setEditCategory}
              style={styles.textInput}
            />
            <Button title="Guardar Cambios" onPress={handleEditSubmit} />
            <Button title="Cancelar" onPress={() => setEditModalVisible(false)} />
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
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  flatlistContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    flexDirection: 'row', // Asegura que los elementos se alineen en una fila
    justifyContent: 'space-between', // Distribuye el espacio entre los elementos
    alignItems: 'center',
  },
  item: {
    flex: 1, // Permite que el contenido del item ocupe el espacio disponible
    marginRight: 16, // Espacio entre el contenido del item y los íconos
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#888',
  },
  category: {
    fontSize: 14,
    color: '#00BFFF',  // Color celeste
    fontStyle: 'italic',
    marginTop: 10,  // Espacio adicional
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 0,
  },
  iconButton: {
    padding: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  dropdownItem: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
    borderRadius: 8,
  },
  modalCategory: {
    fontSize: 16,
    color: '#00BFFF',  // Color celeste
    fontStyle: 'italic',
    marginTop: 10,  // Espacio adicional
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButtonLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default AvisosScreen;
