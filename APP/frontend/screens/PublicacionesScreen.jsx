import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PAGE_SIZE = 10;

const PublicacionesScreen = () => {
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
      const publicacionesCollection = collection(db, 'publicaciones');
      const publicacionesQuery = query(publicacionesCollection, orderBy('fecha', 'desc'), limit(PAGE_SIZE));
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

      setPublicaciones(publicacionesList);
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
      setLastVisible(publicacionesSnapshot.docs[publicacionesSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error al obtener más publicaciones:", error);
      setError("Hubo un error al cargar más publicaciones. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.userEmail}>{item.userEmail}</Text>
      {item.imagen ? <Image source={{ uri: item.imagen }} style={styles.image} onError={(e) => console.log('Error al cargar la imagen:', e.nativeEvent.error)} /> : null}
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.detail}>{item.detalle}</Text>
      <Text style={styles.category}>{item.categoria}</Text>
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
    paddingBottom: 50, // Ajusta este valor según el tamaño de tu barra de navegación en InicioScreen
  },
});

export default PublicacionesScreen;
