import Api from "./api.service"

export default {
    listar: (q = "") => {
        return Api().get("/usuario?q=" + q);
    },
    guardar: (datos) => {
        return Api().post("/usuario", datos);
    },
    mostrar: (id) => {
        return Api().get(`/usuario/${id}`);
    },
    modificar: (id, datos) => {
        return Api().put(`/usuario/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/usuario/${id}`);
    },
}