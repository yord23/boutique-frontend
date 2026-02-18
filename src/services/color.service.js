import Api from "./api.service"

export default {
    listar: () => {
        return Api().get("/colores");
    },
    guardar: (datos) => {
        return Api().post("/colores", datos);
    },
    modificar: (id, datos) => {
        return Api().put(`/colores/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/colores/${id}`);
    },
}