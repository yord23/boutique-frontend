import Api from "./api.service"

export default {
    listar: (q = "") => {
        return Api().get(`/categorias?q=${q}`);
    },
    guardar: (datos) => {
        return Api().post("/categorias", datos);
    },
    mostrar: (id) => {
        return Api().get(`/categorias/${id}`);
    },
    modificar: (id, datos) => {
        return Api().put(`/categorias/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/categorias/${id}`);
    },
}