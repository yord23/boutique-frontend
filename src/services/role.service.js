import Api from "./api.service"

export default {
    listar: () => {
        return Api().get('/roles-gestion');
    },
    guardar: (datos) => {
        return Api().post("/roles-gestion", datos);
    },
    mostrar: (id) => {
        return Api().get(`/usuario/${id}`);
    },
    modificar: (id, datos) => {
        return Api().put(`/roles-gestion/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/roles-gestion/${id}`);
    },
    // Obtener la lista de permisos global (puedes centralizarlo aquí o en usuario.service)
    getPermisos() {
        return Api().get('/permisos');
    }
}