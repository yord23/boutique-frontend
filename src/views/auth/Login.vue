<script setup>
import { ref } from "vue";
import authService from "../../services/auth.service"; // Verifica los puntos ..
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const checked = ref(false);
const credenciales = ref({ email: "", password: "" });
const errors = ref({});
const router = useRouter();
const loading = ref(false);

async function ingresar() {
    console.log("¡Botón presionado!"); // Esto aparecerá en la consola (F12)
    loading.value = true; //activa al empezar
    try {
        const { data } = await authService.login(credenciales.value);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        
        // Lanzar Toast de éxito
        toast.add({ 
            severity: 'success', 
            summary: 'Bienvenido', 
            detail: `Hola ${data.user?.name || 'Usuario'}, acceso concedido`,
            life: 3000 
        });
        router.push({ name: 'Perfil'});
    } catch (error) {
        console.error("Error en el login:", error);
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
        }
       // Lanzar Toast de error
        toast.add({ 
            severity: 'error', 
            summary: 'Error de Acceso', 
            detail: 'Usuario o contraseña incorrectos', 
            life: 4000 
        });
    }finally{
        loading.value = false;
    }
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                            <path d="M44.2613 9.54743L40.9084 10.2176..." fill="var(--primary-color)" />
                        </svg>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido</div>
                        <span class="text-muted-color font-medium">Ingrese sus credenciales para continuar</span>
                    </div>

                    <div>
                        <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo</label>
                        <InputText 
                            id="email" 
                            type="text" 
                            v-model="credenciales.email" 
                            placeholder="correo@ejemplo.com" 
                            class="w-full md:w-[30rem] mb-1" 
                            :class="{ 'p-invalid': errors.email }"
                        />
                        <small class="p-error block mb-4" v-if="errors.email">{{ errors.email[0] }}</small>

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2 mt-4">Contraseña</label>
                        <Password 
                            id="password" 
                            v-model="credenciales.password" 
                            placeholder="Súper secreto" 
                            :toggleMask="true" 
                            class="w-full mb-1" 
                            :class="{ 'p-invalid': errors.password }"
                            :feedback="false" 
                            fluid
                        />
                        <small class="p-error block mb-4" v-if="errors.password">{{ errors.password[0] }}</small>

                        <div class="flex items-center justify-between mt-4 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme" :binary="true" class="mr-2"></Checkbox>
                                <label for="rememberme">Recordarme</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">¿Olvidó su contraseña?</a>
                        </div>

                        <Button label="INGRESAR" :loading="loading" class="w-full text-xl" @click="ingresar"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Ajuste para que el input de Password ocupe todo el ancho en Sakai */
:deep(.p-password-input) {
    width: 100%;
}
</style>
