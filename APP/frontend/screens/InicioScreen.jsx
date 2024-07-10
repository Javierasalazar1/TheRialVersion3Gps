import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ScrollView, Animated, Modal } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { AuthContext } from '../AuthContext';
import AvisosScreen from './AvisosScreen';
import PublicacionesScreen from './PublicacionesScreen';
import MercadoScreen from './MercadoScreen';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const InicioScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('Avisos');
  const [filter, setFilter] = useState({});
  const { logout } = useContext(AuthContext);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'posts'));
    let postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    if (filter) {
      postsData = applyFilter(postsData, filter);
    }
    
    setPosts(postsData);
  };

  const applyFilter = (posts, filter) => {
    // Implementar lógica de filtrado aquí según el filtro seleccionado
    // Por ejemplo, filtrar por categoría, fecha, tipo, etc.
    return posts;
  };

  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(firestore, 'posts', postId));
    fetchPosts();
  };

  const handleSearch = () => {
    // Implementar lógica de búsqueda aquí
  };

  const renderContent = () => {
    switch (selectedScreen) {
      case 'Avisos':
        return <AvisosScreen />;
      case 'Publicaciones':
        return <PublicacionesScreen />;
      case 'Mercado':
        return <MercadoScreen />;
      default:
        return <AvisosScreen />;
    }
  };

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handleFilterSelect = (type, value) => {
    setFilter(prevFilter => ({ ...prevFilter, [type]: value }));
  };

  const resetFilters = () => {
    setFilter({});
    setShowFilters(false);
  };

  const applyFilters = () => {
    fetchPosts();
    setShowFilters(false);
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Inicio</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Menu>
              <MenuTrigger>
                <Image source={require('../assets/user.png')} style={styles.profileIcon} />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => navigation.navigate('Perfil')} text='Mi Perfil' />
                <MenuOption onSelect={handleLogout} text='Cerrar Sesión' />
              </MenuOptions>
            </Menu>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={18} color="black" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <FontAwesome5 name="filter" size={18} color="black" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CrearPublicacion')}>
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>

        {/* Filters Modal */}
        {showFilters && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showFilters}
            onRequestClose={() => setShowFilters(false)}
          >
            <View style={styles.filterModal}>
              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Ordenar por</Text>
                <Picker
                  selectedValue={filter.order}
                  onValueChange={(itemValue) => handleFilterSelect('order', itemValue)}
                >
                  <Picker.Item label="Más Likes" value="mostLikes" />
                  <Picker.Item label="Menos Likes" value="leastLikes" />
                </Picker>

                <Text style={styles.filterTitle}>Categorías</Text>
                <Picker
                  selectedValue={filter.category}
                  onValueChange={(itemValue) => handleFilterSelect('category', itemValue)}
                >
                  <Picker.Item label="Deportes" value="deportes" />
                  <Picker.Item label="Juegos" value="juegos" />
                  <Picker.Item label="Búsqueda" value="busqueda" />
                </Picker>

                <Text style={styles.filterTitle}>Fecha de publicación</Text>
                <Picker
                  selectedValue={filter.date}
                  onValueChange={(itemValue) => handleFilterSelect('date', itemValue)}
                >
                  <Picker.Item label="En cualquier momento" value="anytime" />
                  <Picker.Item label="Hoy" value="today" />
                  <Picker.Item label="Esta semana" value="thisWeek" />
                  <Picker.Item label="Este mes" value="thisMonth" />
                  <Picker.Item label="Este año" value="thisYear" />
                </Picker>

                <View style={styles.filterButtons}>
                  <TouchableOpacity style={styles.filterButtonCancel} onPress={resetFilters}>
                    <Text style={styles.filterButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterButtonApply} onPress={applyFilters}>
                    <Text style={styles.filterButtonText}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setSelectedScreen('Avisos')}>
            <FontAwesome5 name="bullhorn" size={24} color={selectedScreen === 'Avisos' ? 'tomato' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedScreen('Publicaciones')}>
            <FontAwesome5 name="home" size={24} color={selectedScreen === 'Publicaciones' ? 'tomato' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedScreen('Mercado')}>
            <FontAwesome5 name="shopping-cart" size={24} color={selectedScreen === 'Mercado' ? 'tomato' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#6a1b9a',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 5,
    margin: 10,
    padding: 10,
    alignItems: 'center',
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
  post: {
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  postDate: {
    color: '#777',
  },
  postAuthor: {
    color: '#777',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fab: {
    position: 'fixed',
    right: 20,
    bottom: 70,
    backgroundColor: '#6a1b9a',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 8,
  },
  filterModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterButtonCancel: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonApply: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 8, // Para Android
    zIndex: 8, // Para iOS
  },
});

export default InicioScreen;
