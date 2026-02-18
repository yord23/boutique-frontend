import Api from "./api.service"

export default {
    listar: () => {
        return Api().get("/proveedores");
    },
    guardar: (datos) => {
        return Api().post("/proveedores", datos);
    },
    modificar: (id, datos) => {
        return Api().put(`/proveedores/${id}`, datos);
    },
    eliminar: (id) => {
        return Api().delete(`/proveedores/${id}`);
    },
}