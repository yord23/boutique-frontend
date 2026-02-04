import Api from './api.service';

export default {
    listar() {
        return Api().get('/categorias');
    },
    guardar(data) {
        return Api().post('/categorias', data);
    },
    actualizar(id, data) {
        return Api().put(`/categorias/${id}`, data);
    },
    eliminar(id) {
        return Api().delete(`/categorias/${id}`);
    }
};