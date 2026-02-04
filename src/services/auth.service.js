import Api from "./api.service";

export default {
    /**
     * Envía las credenciales al backend (email y password)
     * @param {Object} credenciales 
     * @returns {Promise}
     */
    login(credenciales) {
        return Api().post(`/v1/auth/login`, credenciales);
    },

    /**
     * Registra un nuevo usuario/vendedor
     * @param {Object} datos 
     * @returns {Promise}
     */
    register(datos) {
        return Api().post(`/v1/auth/register`, datos);
    },

    /**
     * Obtiene la información del usuario autenticado mediante el token
     * @returns {Promise}
     */
    profile() {
        return Api().get(`/v1/auth/profile`);
    },

    /**
     * Finaliza la sesión en el servidor
     * @returns {Promise}
     */
    logout() {
        return Api().post(`/v1/auth/logout`);
    }
};