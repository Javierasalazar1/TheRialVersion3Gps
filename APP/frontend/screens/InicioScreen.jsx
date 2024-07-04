import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { AuthContext } from '../AuthContext';
import AvisosScreen from './AvisosScreen';
import PublicacionesScreen from './PublicacionesScreen';
import MercadoScreen from './MercadoScreen';
import CrearPublicacionScreen from './CrearPublicacionScreen';

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
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'posts'));
    const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPosts(postsData);
  };

  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(firestore, 'posts', postId));
    fetchPosts();
  };

  const handleSearch = () => {
    // Implementa la lógica de búsqueda
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
                <MenuOption onSelect={() => alert('Mi Perfil')} text='Mi Perfil' />
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
          <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
            <FontAwesome5 name="filter" size={18} color="black" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={[styles.contentContainer, { paddingBottom: 50 }]} /* Ajusta este valor según el tamaño de tu barra de navegación */>
          {renderContent()}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CrearPublicacion')}>
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>

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
    margin: 20,
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
    padding: 20,
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
    position: 'absolute',
    right: 20,
    bottom: 50,
    backgroundColor: '#6a1b9a',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default InicioScreen;
