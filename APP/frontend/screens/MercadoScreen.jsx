import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 10;

const MercadoScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

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

  const renderItem = ({ item }) => (
    <View style={styles.item}>
       <View style={styles.header}>
      <Text style={styles.name}>{item.usuario}</Text>
        <TouchableOpacity onPress={() => {/* Implementar funcionalidad del botón aquí */}}>
          <Ionicons name="ellipsis-vertical" size={22} color="black" />
        </TouchableOpacity>
        </View>
      <Image source={{ uri: item.imagen }} style={styles.image} />
      <Text style={styles.title}>{item.nombre}</Text>
      <View style={styles.header}>
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
        contentContainerStyle={styles.flatlistContent}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    height: 100, // Tamaño fijo más pequeño
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  flatlistContent: {
    paddingBottom: 50, // Ajusta este valor según el tamaño de tu barra de navegación en InicioScreen
  },
});

export default MercadoScreen;
