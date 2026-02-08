import Api from './api.service';

export default {
    listar(params) {
        return Api().get('/proveedores', { params });
    },
    listarSimple() {
        return Api().get('/proveedores/listado');
    },
    guardar(data) {
        return Api().post('/proveedores', data);
    },
    actualizar(id, data) {
        return Api().put(`/proveedores/${id}`, data);
    },
    eliminar(id) {
        return Api().delete(`/proveedores/${id}`);
    }
};