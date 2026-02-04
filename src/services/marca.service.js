import Api from './api.service';

export default {
    listar() {
        return Api().get('/marcas');
    },
    guardar(data) {
        return Api().post('/marcas', data);
    },
    actualizar(id, data) {
        return Api().put(`/marcas/${id}`, data);
    },
    eliminar(id) {
        return Api().delete(`/marcas/${id}`);
    }
};