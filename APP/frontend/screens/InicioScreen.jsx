import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated, Modal } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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
  const [selectedScreen, setSelectedScreen] = useState('Avisos');
  const { logout } = useContext(AuthContext);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Cambiar el título del header según la pantalla seleccionada
    const titles = {
      Avisos: 'Avisos',
      Publicaciones: 'Publicaciones',
      Mercado: 'Mercado',
    };
    navigation.setOptions({ title: titles[selectedScreen] });
  }, [selectedScreen, navigation]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'posts'));
    const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPosts(postsData);
  };

  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(firestore, 'posts', postId));
    fetchPosts();
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

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuAnimation._value === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
    closeMenu();
  };

  const menuHeight = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], // Ajusta la altura del menú desplegable según necesites
  });

  return (
    <MenuProvider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{selectedScreen}</Text>
          <View style={styles.headerRight}>
            <Menu>
              <MenuTrigger customStyles={triggerStyles}>
                <View style={styles.menuButton}>
                  <Ionicons name="flower-sharp" size={24} color="white" />
                  <Text style={styles.TextMenu}>Menú</Text>
                </View>
              </MenuTrigger>
              <MenuOptions customStyles={optionsStyles}>
                <MenuOption onSelect={() => navigation.navigate('Moderación')}>
                  <Text style={styles.menuOptionText}>Moderar</Text>
                </MenuOption>
                <MenuOption onSelect={() => navigation.navigate('Reportes')}>
                  <Text style={styles.menuOptionText}>Reportes</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
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
        {/* Content */}
        <ScrollView contentContainerStyle={styles.contentContainer} stickyHeaderIndices={[0, 1]}>
          {renderContent()}
        </ScrollView>
        {/* Add Button */}
        <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
        {/* Animated Menu */}
        <Animated.View style={[styles.menuContainer, { height: menuHeight }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Crear Aviso')}>
            <Text style={styles.menuText}>Avisos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Crear Publicacion')}>
            <Text style={styles.menuText}>Publicaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Publicar Producto')}>
            <Text style={styles.menuText}>Market</Text>
          </TouchableOpacity>
        </Animated.View>
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setSelectedScreen('Avisos')}>
            <FontAwesome5 name="bullhorn" size={24} color={selectedScreen === 'Avisos' ? '#246fa8' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedScreen('Publicaciones')}>
            <FontAwesome5 name="home" size={24} color={selectedScreen === 'Publicaciones' ? '#246fa8' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedScreen('Mercado')}>
            <FontAwesome5 name="shopping-cart" size={24} color={selectedScreen === 'Mercado' ? '#246fa8' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>
    </MenuProvider>
  );
};

const triggerStyles = {
  triggerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
};

const optionsStyles = {
  optionsContainer: {
    padding: 5,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cfd9df',
  },
  header: {
    backgroundColor: '#143d5c',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  TextMenu: {
    color: 'white',
    marginLeft: 5,
  },
  profileIcon: {
    width: 40,
    height: 40,
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
    backgroundColor: '#143d5c',
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
    marginTop: 5,
  },

  menuOptionText: {
    fontSize: 16,
  },

  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterButtonCancel: {
    backgroundColor: '#ef8016',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonApply: {
    backgroundColor: '#143d5c',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
  },
  filterPicker:{
    fontSize: 10,
  },
  menuContainer: {
    position: 'fixed',
    right: 20,
    bottom: 130,
    backgroundColor: '#fff',
    width: 120,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    paddingHorizontal: 10,
    zIndex: 8,
  },
  menuItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  menuText: {
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
    elevation: 8,
    zIndex: 8,
  },
});

export default InicioScreen;
