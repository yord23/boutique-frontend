import Api from './api.service';

export const TallaService = {
    listar() { return Api().get('/tallas'); },
    guardar(data) { return Api().post('/tallas', data); },
    eliminar(id) { return Api().delete(`/tallas/${id}`); }
};