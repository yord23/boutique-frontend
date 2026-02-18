import Api from "./api.service"

export default {
    listar: () => {
        return Api().get("/marcas");
    },
    guardar: (datos) => {
        return Api().post("/marcas", datos);
    },
    modificar: (id, datos) => {
        return Api().put(`/marcas/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/marcas/${id}`);
    },
}