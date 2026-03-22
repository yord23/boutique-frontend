import Api from "./api.service";

export default {
    /**
     * Obtiene el historial de actividades del sistema
     */
    getLogs() {
        return Api().get('/v1/auditoria');
    }
};