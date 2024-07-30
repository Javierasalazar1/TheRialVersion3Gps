import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c8cacc',
        paddingHorizontal: 20,
        padding: 10,
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
        marginTop: 10,
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
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemText: {
        flex: 1,
    },
    userEmail: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555',
        maxWidth: '250px',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
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
    flagIcon: {
        alignSelf: 'flex-end',
        marginTop: 'auto',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    reportContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 10,
    },
    reportReasonBox: {
        padding: 10,
        margin: 5,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    reportReasonText: {
        fontSize: 16,
    },
    reportInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        height: 100,
        width: '80%', // Ajusta el ancho según tus necesidades
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        width: '100%',
    },
    detailButton: {
      backgroundColor: '#ef8016',
      padding: 10,
      borderRadius: 10,
      marginHorizontal: 7,
      width: '45%',
  },
  detailButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    justifyContent: 'center',
},
    cancelButton: {
        backgroundColor: '#ef8016',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '40%',
    },
    closeButton: {
      backgroundColor: '#ef8016',
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      width: '40%',
      marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
},
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#143d5c',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '40%',
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    ima: {
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: 'gray',
        minWidth: '100px',
    },
    reportIcon: {
        marginLeft: 10,
    },
    modalLabel: {
        fontSize: 16,
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        minHeight: 100,
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    modalButtons: {
        padding: 10,
        borderRadius: 10,
        width: '40%',
        justifyContent: 'space-around',
    },
    reasonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 10,
    },
    reportOption: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
    },
    reportOptionText: {
        fontSize: 18,
    },
    selectedReportOption: {
        fontWeight: 'bold',
        color: '#143d5c',
        backgroundColor: '#e0e0e0',
    },
    selectedReportOptionText: {
        color: 'white',
    },
});

    
    export default styles;

