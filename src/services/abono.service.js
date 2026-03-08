import Api from './api.service';

export default {
    registrarAbono(data) {
        return Api().post('/caja/abonos', data);
    },
    obtenerHistorialPorCliente(clienteId) {
        return Api().get(`/caja/abonos/cliente/${clienteId}`);
    }
}