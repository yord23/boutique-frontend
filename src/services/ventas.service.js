import Api from './api.service';

export default {
    guardar(data) {
        // Envia el carrito (items, payment_method, etc.) a /api/ventas
        return Api().post('/ventas', data);
    }
};