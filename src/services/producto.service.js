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
    }
};