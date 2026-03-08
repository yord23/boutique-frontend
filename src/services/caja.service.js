import Api from './api.service';

export default {
    verificarEstado() {
        return Api().get('/caja/estado');
    },
    abrir(monto) {
        return Api().post('/caja/abrir', { monto_inicial: monto });
    },
    cerrar(datos) {
        // datos incluiría { efectivo_real, notas }
        return Api().post('/caja/cerrar', datos);
    },
    // ... funciones anteriores
    historial() {
        return Api().get('/caja/historial');
    },
    // ...
    getStats() {
        return Api().get('/caja/stats');
    }
}