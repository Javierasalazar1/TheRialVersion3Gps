import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const FilterModal = ({ visible, onClose, filter, handleFilterSelect, resetFilters, applyFilters }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.filterModal}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Ordenar por:</Text>
          <Picker
          style={styles.filterPicker}
            selectedValue={filter.order}
            onValueChange={(itemValue) => handleFilterSelect('order', itemValue)}
          >
            <Picker.Item label="Más Likes" value="mostLikes" />
            <Picker.Item label="Menos Likes" value="leastLikes" />
          </Picker>

          <Text style={styles.filterTitle}>Categorías:</Text>
          <Picker
          style={styles.filterPicker}
            selectedValue={filter.category}
            onValueChange={(itemValue) => handleFilterSelect('category', itemValue)}
          >
            <Picker.Item label="Deportes" value="deportes" />
            <Picker.Item label="Juegos" value="juegos" />
            <Picker.Item label="Búsqueda" value="busqueda" />
          </Picker>

          <Text style={styles.filterTitle}>Fecha de publicación:</Text>
          <Picker
            style={styles.filterPicker}
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
  );
};

const styles = StyleSheet.create({
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
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  filterPicker: {
    fontSize: 12,
    padding: 5,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterButtonCancel: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 3,
  },
  filterButtonApply: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 3,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default FilterModal;
