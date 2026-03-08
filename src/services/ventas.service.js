import Api from './api.service';

export default {
    guardar(data) {
        // Envia el carrito (items, payment_method, etc.) a /api/ventas
        return Api().post('/ventas', data);
    },
    // Si necesitas obtener el historial de ventas o algo similar
    obtenerHistorial() {
        return Api().get('/ventas');
    }
};