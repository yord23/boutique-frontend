import Api from './api.service';

export default {
   obtenerTodos() {
        return Api().get('/caja/clientes');
    },
    guardar(datos) {
        return Api().post('/caja/clientes', datos);
    }
};