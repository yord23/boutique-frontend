import Api from './api.service';
export default {
    listar() { 
        return Api().get('/colores'); 
    },
    guardar(data) { 
        return Api().post('/colores', data); 
    },
    eliminar(id) { 
        return Api().delete(`/colores/${id}`); 
    }
};