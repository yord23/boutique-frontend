import Api from "./api.service"

export default {
    listar: () => {
        return Api().get("/tallas");
    },
    guardar: (datos) => {
        return Api().post("/tallas", datos);
    },
    modificar: (id, datos) => {
        return Api().put(`/tallas/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/tallas/${id}`);
    },
}