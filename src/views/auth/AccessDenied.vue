<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 26, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <div class="grid flex-column align-items-center" style="max-width: 500px">
                        
                        <div class="flex align-items-center justify-center bg-orange-100 dark:bg-orange-900/40 border-circle w-4rem h-4rem mb-4">
                            <i class="pi pi-fw pi-lock text-orange-500 text-3xl"></i>
                        </div>

                        <h1 class="text-900 dark:text-0 font-bold text-4xl mb-2 text-center">Acceso Denegado</h1>
                        <span class="text-600 dark:text-400 mb-6 text-center">No tienes los permisos necesarios. Por favor, contacta con el administrador.</span>
                        
                        <img src="https://primefaces.org/sakai-vue/demo/images/access/asset-access.svg" 
                             alt="Access denied" 
                             class="mb-6 w-9" />
                        
                        <Button label="Regresar al Inicio" 
                                class="p-button-warning w-full" 
                                icon="pi pi-arrow-left"
                                @click="goHome" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goHome = () => {
    // Te manda al login o perfil para "resetear" la navegación
    router.push('/admin/perfil');
};
</script>

<style scoped>
/* Forzamos que ignore márgenes externos del layout si existieran */
:deep(.min-h-screen) {
    min-height: 100vh !important;
}
</style>
<!--template>
    <div style="background: red; color: white; padding: 50px;">
        <h1>PRUEBA DE ACCESO DENEGADO</h1>
        <p>Si ves esto, el componente carga bien.</p>
    </div>
</template-->