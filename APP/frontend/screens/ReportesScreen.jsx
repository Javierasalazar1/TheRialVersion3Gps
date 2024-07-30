import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from '../styles';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDK71FGurfMwk2XbZ3UwzdC-uTHegEZkj4",
  authDomain: "gps2024-119de.firebaseapp.com",
  databaseURL: "https://gps2024-119de-default-rtdb.firebaseio.com",
  projectId: "gps2024-119de",
  storageBucket: "gps2024-119de.appspot.com",
  messagingSenderId: "816992076661",
  appId: "1:816992076661:web:e715cd65134c743dcc493c",
  measurementId: "G-VXR027HFXL"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const ReportesScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        // Obtener todos los reportes
        const reportesCollection = collection(firestore, 'reports');
        const reportesSnapshot = await getDocs(reportesCollection);
        const reportesData = reportesSnapshot.docs.map(doc => doc.data());

        // Obtener todas las publicaciones con reportes
        const publicacionesIds = [...new Set(reportesData.map(reporte => reporte.publicationId))];

        // Obtener detalles de cada publicación
        const publicacionesPromises = publicacionesIds.map(id =>
          getDoc(doc(firestore, 'publicaciones', id))
        );

        const publicacionesSnapshots = await Promise.all(publicacionesPromises);
        const publicacionesData = publicacionesSnapshots.map(snapshot => ({ id: snapshot.id, ...snapshot.data() }));

        setPublicaciones(publicacionesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const handlePublicationPress = (publication) => {
    setSelectedPublication(publication);
  };

  const handleReportDetailPress = async (publicationId) => {
    try {
      // Obtener los reportes asociados a esta publicación
      const reportesCollection = collection(firestore, 'reports');
      const reportesSnapshot = await getDocs(reportesCollection);
      const reportesData = reportesSnapshot.docs.map(doc => doc.data());

      // Filtrar el reporte asociado a la publicación seleccionada
      const reportDetail = reportesData.find(report => report.publicationId === publicationId);

      setReportDetail(reportDetail);
    } catch (error) {
      setError(error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.detail}>{item.detalle}</Text>
      <Text style={styles.category}>{item.categoria}</Text>
      <Text style={styles.date}>{item.fecha}</Text>
      <Text style={styles.username}>Publicado por: {item.username}</Text>
      <Text style={styles.likes}>Likes: {item.like}</Text>
      <TouchableOpacity onPress={() => handlePublicationPress(item)} style={styles.button}>
        <Text style={styles.buttonText}>Ver Detalle de Publicación</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReportDetailPress(item.id)} style={styles.button}>
        <Text style={styles.buttonText}>Ver Detalle del Reporte</Text>
      </TouchableOpacity>
    </View>
  );

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
    <View style={styles.container}>
      <FlatList
        data={publicaciones}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatlistContent}
      />
      {selectedPublication && (
        <Modal
          transparent={true}
          visible={!!selectedPublication}
          onRequestClose={() => setSelectedPublication(null)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <Text style={styles.modalTitle}>Detalles de la Publicación</Text>
              <Text style={styles.modalText}>Nombre: {selectedPublication.nombre}</Text>
              <Text style={styles.modalText}>Detalle: {selectedPublication.detalle}</Text>
              <Text style={styles.modalText}>Categoría: {selectedPublication.categoria}</Text>
              <Text style={styles.modalText}>Fecha: {selectedPublication.fecha}</Text>
              <Text style={styles.modalText}>Likes: {selectedPublication.like}</Text>
              <TouchableOpacity onPress={() => setSelectedPublication(null)} style={styles.closeButton}>
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
      {reportDetail && (
        <Modal
          transparent={true}
          visible={!!reportDetail}
          onRequestClose={() => setReportDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <Text style={styles.modalTitle}>Detalles del Reporte</Text>
              <Text style={styles.modalText}>Razón: {reportDetail.reason}</Text>
              <Text style={styles.modalText}>Información Adicional: {reportDetail.additionalInfo}</Text>
              <TouchableOpacity onPress={() => setReportDetail(null)} style={styles.closeButton}>
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ReportesScreen;
