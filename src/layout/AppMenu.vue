<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
//const user = JSON.parse(localStorage.getItem('user')); // O desde tu Store/Pinia

// Leemos de "user_data" que es como lo guardas en Login.vue
const user = JSON.parse(localStorage.getItem('user_data') || 'null');

const model = ref([
    {
        label: 'Panel Principal',
        visible: user?.role === 'admin',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin/Dashboard' }]
    },
    {
        label: 'Inventario',
        visible: user?.role === 'admin',
        items: [
            { label: 'Productos', icon: 'pi pi-fw pi-tag', to: '/admin/productos' },
            { label: 'Categorías', icon: 'pi pi-fw pi-filter', to: '/admin/categorias' },
            { label: 'Tallas y Colores', icon: 'pi pi-fw pi-th-large', to: '/admin/tallas-colores' },
            { label: 'Registrar Compra', icon: 'pi pi-fw pi-shopping-cart', to: '/admin/compras' },
            { label: 'Historial de Compras', icon: 'pi pi-fw pi-history', to: '/admin/historial-compras' },
            { label: 'Reporte de Inventario', icon: 'pi pi-fw pi-chart-bar', to: '/admin/inventario' },
            { label: 'Gestión de Precios',   icon: 'pi pi-fw pi-dollar',   to: '/admin/precios' },
        ]
    },

    {
        label: 'Operaciones',
        visible: true, // Visible para todos
        items: [
            { label: 'Realizar Venta', icon: 'pi pi-fw pi-money-bill', to: '/admin/ventas' },
            { label: 'Historial de Ventas', icon: 'pi pi-fw pi-history', to: '/admin/historial-caja',visible: user?.role === 'admin' },
            { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/clientes' },
            { label: 'Abonos', icon: 'pi pi-fw pi-wallet', to: '/admin/abonos' },
            { label: 'Auditoría', icon: 'pi pi-fw pi-file', to: '/admin/auditoria', visible: user?.role === 'admin' }
        ]
    },/*
    {
        label: 'Analítica y Reportes',
        items: [
            { label: 'Reporte de Ventas', icon: 'pi pi-fw pi-chart-bar', to: '/reportes/ventas' },
            { label: 'Productos más Vendidos', icon: 'pi pi-fw pi-star', to: '/reportes/top-productos' },
            { label: 'Corte de Caja', icon: 'pi pi-fw pi-file-pdf', to: '/admin/reportes/corte-caja' }
        ]
    },*/
    {
        label: 'Seguridad',
        visible: user?.role === 'admin',
        items: [
            {   label: 'Vendedores (Usuarios)', 
                icon: 'pi pi-fw pi-user-plus', 
                to: '/admin/usuarios' },
            {   label: 'Roles y Permisos', 
                icon: 'pi pi-fw pi-shield', 
                to: '/admin/roles' }
        ]
    },

    {
    label: 'Test',
    items: [
        { label: 'Verificar Ruta', 
        icon: 'pi pi-check', 
        to: '/admin/prueba' }
    ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
