import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFileToStorage = async (file) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    
    // Convertir la URI de la imagen a un blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Subir el blob a Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Archivo subido correctamente');
    return downloadURL;
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw error;
  }
};