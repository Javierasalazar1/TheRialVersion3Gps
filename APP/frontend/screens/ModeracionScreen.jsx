import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const ModeracionScreen = () => {
  const handleRequestEdit = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming soon...',
      icon: <Ionicons name="construct-outline" size={80} color="black" />,
      position: 'top',
    });
  };

  const handleDeletePost = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming soon...',
      icon: <Ionicons name="hammer-outline" size={80} color="black" />,
      position: 'top',
    });
  };

  const handleSanctionUser = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming soon...',
      icon: <Ionicons name="alert-circle-outline" size={80} color="black" />,
      position: 'top',
    });
  };

  return (
    <View style={styles.container}>
      <Ionicons name="build-outline" size={120} color="#007BFF" style={styles.icon} />
      <Text style={styles.text}>Moderación</Text>

      <TouchableOpacity style={styles.button} onPress={handleRequestEdit}>
        <Text style={styles.buttonText}>Solicitar Edición de Publicación</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6347' }]} onPress={handleDeletePost}>
        <Text style={styles.buttonText}>Eliminar Publicación</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6347' }]} onPress={handleSanctionUser}>
        <Text style={styles.buttonText}>Sancionar Usuario</Text>
      </TouchableOpacity>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ModeracionScreen;
