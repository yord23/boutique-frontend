import Api from './api.service';

export default {
    listar() {
        return Api().get('/productos');
    },
    guardar(data) {
        return Api().post('/productos', data);
    },
    actualizar(id, data) {
        return Api().put(`/productos/${id}`, data);
    },
    eliminar(id) {
        return Api().delete(`/productos/${id}`);
    }
};