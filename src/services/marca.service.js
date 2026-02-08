import Api from './api.service';

export default {
    listar(params) {
        return Api().get('/marcas', { params }); // Para la tabla con búsqueda
    },
    listarSimple() {
        return Api().get('/marcas/listado'); // Para el select de productos
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