// src/utils/permisos.js
export const hasPermission = (permiso) => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;

    try {
        const user = JSON.parse(userData);
        
        // 1. Verificación de seguridad para Admin
        // Usamos toLowerCase() por si en la DB viene como 'ADMIN' o 'Admin'
        if (user.role && user.role.toLowerCase() === 'admin') {
            return true;
        }

        // 2. Verificación de permisos para el resto
        return Array.isArray(user.permissions) && user.permissions.includes(permiso);
    } catch (e) {
        return false;
    }
};