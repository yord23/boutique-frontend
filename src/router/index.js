import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue'; // <--- ESTA ES LA LÍNEA QUE FALTA
// 1. Definición de las rutas (lo que ya tienes)
const routes = [
    {
        path: '/',
        // En lugar de redirect, podemos cargar el login directamente 
        // para evitar que el router "piense" demasiado
        component: () => import('@/views/auth/Login.vue'),

    },
    {   
        path: '/login', 
        name: 'Login', 
        component: () => import('@/views/auth/Login.vue'),
        meta: {redirectIfAuth: true} 
    },
    {
        path: '/admin',
        component: AppLayout, // El layout de Sakai
        meta: { requireAuth: true }, // Todo lo que esté en /admin requiere token
        children: [
            {   path: 'perfil', 
                name: 'Perfil', 
                component: () => import('@/views/admin/Perfil.vue'),
                
            },
            // Si quieres que al entrar a /admin te mande directo a perfil:
            // ... otras rutas que ya tengas
            {
                path: 'usuarios',
                name: 'usuarios',
                component: () => import('@/views/admin/Usuarios.vue'),
                //meta: {redirectIfAuth: true} 
            },
            {
                path: 'productos',
                name: 'productos',
                component: () => import('@/views/admin/Productos.vue'),
                //meta: {redirectIfAuth: true} 
            },
            
            {
                path: 'ventas',
                name: 'ventas',
                component: () => import('@/views/admin/Ventas.vue'),
                //meta: {redirectIfAuth: true} 
            },
            // ... dentro de children: [ ]
            {
                path: 'categorias', // Esto crea /admin/categorias
                name: 'categorias',
                component: () => import('@/views/admin/Categorias.vue') // Crea este archivo aunque esté vacío
            },
            {
                path: 'marcas', // Esto crea /admin/marcas
                name: 'marcas',
                component: () => import('@/views/admin/Marcas.vue')
            },
            // Añadimos esta para evitar el error del menú
            {
                path: 'reportes/corte-caja',
                name: 'CorteCaja',
                component: () => import('@/views/admin/Usuarios.vue') // Cambia esto por el componente real cuando lo tengas
            },
            {
            path: 'prueba',
            name: 'prueba-test',
            component: () => import('@/views/admin/Prueba.vue')
        },
        
        ]
    },
    // Redirección por defecto: si entran a "/" los mandamos al login
    {
        path: '/',
        redirect: '/login'
    }
];

// 2. CREACIÓN DEL ROUTER (Lo que preguntaste)
const router = createRouter({
    history: createWebHistory(),
    routes: routes // Aquí se le pasan las rutas de arriba
});

// 3. EL GUARDIÁN (Middleware para proteger las rutas)
/*router.beforeEach((to, from, next) => {
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('access_token');

    if (authRequired && !loggedIn) {
        return next('/login');
    }
    next();
});*/
/*router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('access_token');
    
    // Si la ruta es login o la raíz, permitimos pasar
    if (to.path === '/login' || to.path === '/') {
        if (loggedIn) return next('/admin/perfil'); // Si ya está logueado, al perfil
        return next(); 
    }

    // Si no está logueado y quiere ir a admin, al login
    if (!loggedIn && to.path.startsWith('/admin')) {
        return next('/login');
    }

    next();
});*/
// ... (tus imports arriba)

// Guards
/*router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("access_token");

    // Verificar si la ruta (o alguna de sus padres) requiere autenticación
    if (to.matched.some(record => record.meta.requireAuth)) {
        if (!token) {
            return next({ name: 'Login' }); 
        }
        return next();
    }

    // Verificar si la ruta pide redireccionar si ya está autenticado (Login)
    if (to.matched.some(record => record.meta.redirectIfAuth) && token) {
        if(to.name!= 'Perfil'){
            return next({ name: 'Perfil' });
        }
         
    }

    return next();
});*/

// GUARD SIMPLIFICADO Y FUNCIONAL
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("access_token");

    // 1. Si la ruta requiere autenticación y no hay token -> al Login
    if (to.matched.some(record => record.meta.requireAuth) && !token) {
        return next({ name: 'Login' });
    }

    // 2. Si el usuario ya está logueado e intenta ir al Login -> al Perfil
    if (to.matched.some(record => record.meta.redirectIfAuth) && token) {
        return next({ name: 'Perfil' });
    }

    next();
});


export default router;