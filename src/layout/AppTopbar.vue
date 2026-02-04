<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast"; // Importar el servicio
import Popover from 'primevue/popover';

// Lógica de Sakai
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

// Lógica de Usuario y Perfil
const router = useRouter();
const op = ref(); 
const usuario = ref({ name: 'Cargando...', email: '', role: 'Usuario' });
const toast = useToast();

onMounted(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        usuario.value = JSON.parse(userData);
    }
});

const toggleProfile = (event) => {
    op.value.toggle(event);
};

const logout = () => {
    // 1. Lanzamos el mensaje
    toast.add({ 
        severity: 'info', 
        summary: 'Sesión Finalizada', 
        detail: 'Has salido del sistema correctamente', 
        life: 3000 
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setTimeout(() => {
        router.push('/login');
    },500);
    }
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467ZM33.3284 11.4538C31.6493 10.2396 29.5855 9.52381 27.3546 9.52381C25.1195 9.52381 23.0524 10.2421 21.3717 11.4603C20.0078 11.3232 18.6475 11.1387 17.2933 10.907C19.7453 8.11308 23.3438 6.34921 27.3546 6.34921C31.36 6.34921 34.9543 8.10844 37.4061 10.896C36.0521 11.1292 34.692 11.3152 33.3284 11.4538ZM43.826 18.0518C43.881 18.6003 43.9091 19.1566 43.9091 19.7194C43.9091 28.8568 36.4973 36.2642 27.3546 36.2642C18.2117 36.2642 10.8 28.8568 10.8 19.7194C10.8 19.1615 10.8276 18.61 10.8816 18.0663L7.75383 17.4411C7.66775 18.1886 7.62354 18.9488 7.62354 19.7194C7.62354 30.6102 16.4574 39.4388 27.3546 39.4388C38.2517 39.4388 47.0855 30.6102 47.0855 19.7194C47.0855 18.9439 47.0407 18.1789 46.9536 17.4267L43.826 18.0518ZM44.2613 9.54743L40.9084 10.2176C37.9134 5.95821 32.9593 3.1746 27.3546 3.1746C21.7442 3.1746 16.7856 5.96385 13.7915 10.2305L10.4399 9.56057C13.892 3.83178 20.1756 0 27.3546 0C34.5281 0 40.8075 3.82591 44.2613 9.54743Z" fill="var(--primary-color)" />
                </svg>
                <span>SISTEMA</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveToClass: 'hidden', leaveActiveClass: 'p-anchored-overlay-leave-active', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <div class="layout-topbar-menu">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    
                    <button type="button" class="layout-topbar-action" @click="toggleProfile">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>

        <Popover ref="op" appendTo="body" style="width: 250px">
            <div class="flex flex-column align-items-center border-bottom-1 surface-border pb-3 mb-3">
                <div class="border-circle bg-primary w-3rem h-3rem flex align-items-center justify-content-center mb-2">
                    <span class="text-xl font-bold text-white">{{ usuario.name.charAt(0) }}</span>
                </div>
                <span class="font-bold text-900">{{ usuario.name }}</span>
                <span class="text-sm text-600">{{ usuario.email }}</span>
            </div>

            <ul class="list-none p-0 m-0">
                <li class="p-2 hover:surface-100 border-round cursor-pointer flex align-items-center" @click="router.push('/admin/perfil')">
                    <i class="pi pi-user mr-3"></i>
                    <span>Mi Perfil</span>
                </li>
                <li class="p-2 hover:surface-100 border-round cursor-pointer flex align-items-center">
                    <i class="pi pi-cog mr-3"></i>
                    <span>Configuración</span>
                </li>
                <hr class="mb-2 border-top-1 surface-border" />
                <li class="p-2 hover:surface-100 border-round cursor-pointer flex align-items-center text-red-500" @click="logout">
                    <i class="pi pi-power-off mr-3"></i>
                    <span class="font-bold">Cerrar Sesión</span>
                </li>
            </ul>
        </Popover>
        <Toast />
    </div>
</template>