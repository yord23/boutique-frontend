import Api from "./api.service"

export default {
    // Para buscar productos mientras escribes en el formulario
    buscarProductos(query) {
        return Api().get(`/caja/products/search?q=${query}`);
    },
    // Para registrar la compra final
    registrar(data) {
        return Api().post('/caja/purchases', data);
    },
    // Agrega esto a tu purchaseService existente
    obtenerHistorial() {
        return Api().get('/caja/purchases');
    }
}