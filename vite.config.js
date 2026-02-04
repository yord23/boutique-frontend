import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig({
    plugins: [
        vue(),
        // Esto permite usar componentes de PrimeVue sin importarlos uno por uno
        Components({
            resolvers: [
                PrimeVueResolver()
            ]
        })
    ],
    resolve: {
        alias: {
            // Esto es CRUCIAL para que las rutas con '@' funcionen
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Permite que Vite entienda la sintaxis moderna de SASS que usa Sakai
                api: 'modern-compiler' 
            }
        }
    }
});