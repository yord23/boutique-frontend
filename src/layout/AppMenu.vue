<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Panel Principal',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
    },
    {
        label: 'Inventario',
        items: [
            { label: 'Productos', icon: 'pi pi-fw pi-tag', to: '/admin/productos' },
            { label: 'Categorías', icon: 'pi pi-fw pi-filter', to: '/admin/categorias' }
        ]
    },

    {
        label: 'Operaciones',
        items: [
            { label: 'Realizar Venta', icon: 'pi pi-fw pi-money-bill', to: '/admin/ventas' },
            { label: 'Historial de Ventas', icon: 'pi pi-fw pi-history', to: '/ventas' },
            { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/clientes' }
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
        items: [
            {   label: 'Vendedores (Usuarios)', 
                icon: 'pi pi-fw pi-user-plus', 
                to: '/admin/usuarios' }
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
