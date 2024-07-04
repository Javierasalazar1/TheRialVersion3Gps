import { setupFTP } from '../config/configFTP.js';
import { handleError } from '../utils/errorHandler.js';
import { respondError, respondSuccess } from '../utils/resHandler.js'; // Corregido: respondError y respondSuccess importados desde resHandler.js


// Lista los archivos en el directorio raíz del servidor FTP
export async function listFiles(req, res) {
  try {
    const client = await setupFTP();
    client.list((err, list) => {
      if (err) {
        handleError(err, '/ftpController.js -> listFiles');
        respondError(req, res, 500, err);
        client.end(); // Siempre cierra la conexión en caso de error
      } else {
        respondSuccess(req, res, 200, list);
        client.end(); // Cierra la conexión después de una respuesta exitosa
      }
    });
  } catch (err) {
    handleError(err, '/ftpController.js -> listFiles');
    respondError(req, res, 500, err.message);
  }
};

// Descarga un archivo desde el servidor FTP
export async function downloadFile(req, res) {
  try {
    const client = await setupFTP();
    const filename = req.params.filename;
    client.get(filename, (err, stream) => {
      if (err) {
        handleError(err, '/ftpController.js -> downloadFile');
        respondError(req, res, 500, err);
        client.end(); // Siempre cierra la conexión en caso de error
      } else {
        stream.once('close', () => {
          client.end(); // Cierra la conexión después de completar la descarga
        });
        stream.pipe(res);
      }
    });
  } catch (err) {
    handleError(err, '/ftpController.js -> downloadFile');
    respondError(req, res, 500, err.message);
  }
};


// Sube un archivo al servidor FTP
export async function uploadFileToFTP(req, res) {
  try {
    const client = await setupFTP();
    const file = req.file; // Suponiendo que estás usando multer u otro middleware para subir archivos
    const remotePath = '' + file.originalname; // Ruta remota para subir

    await new Promise((resolve, reject) => {
      client.put(file.path, remotePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
        client.end(); // Cierra la conexión después de subir el archivo
      });
    });

    respondSuccess(req, res, 200, '¡Archivo subido exitosamente!');
  } catch (err) {
    handleError(err, '/ftpController.js -> uploadFileToFTP');
    respondError(req, res, 500, err.message);
  }
};


export default {
  downloadFile,
  listFiles,
  uploadFileToFTP,
};
