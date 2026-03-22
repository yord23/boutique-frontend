import Api from './api.service';

export default {
    listar(params) {
        return Api().get('/productos', { params }); // Ejemplo: { q: 'jean', page: 1 }
    },
    mostrar(id) {
        return Api().get(`/productos/${id}`);
    },
    guardar(data) {
        return Api().post('/productos', data);
    },
    actualizar(id, data) {
        return Api().post(`/productos/${id}`, data);
    },
    eliminar(id) {
        return Api().delete(`/productos/${id}`);
    },
    obtenerReporteInventario() {
        return Api().get('/caja/inventory/report');
    },
    // Obtener lista para el reporte y edición
    obtenerPrecios() {
        return Api().get('/caja/products/pricing');
    },
    // Guardar el cambio de precio
    actualizarPrecio(id, datos) {
        return Api().put(`/caja/products/${id}/price`, datos);
    }
};