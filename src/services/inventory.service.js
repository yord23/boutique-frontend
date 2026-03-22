import Api from "./api.service"

export default {
    obtenerAlertas() {
        return Api().get('/caja/inventory/alerts');
    }
}