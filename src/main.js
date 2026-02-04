import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Asegúrate de tener tu archivo router configurado
import { createPinia } from 'pinia'; // Importamos Pinia para tu Login

// PrimeVue y Temas
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Popover from 'primevue/popover';
import Toast from 'primevue/toast';


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';

// ... debajo de tus otros imports de PrimeVue
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Tag from 'primevue/tag';
import RadioButton from 'primevue/radiobutton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import KeyFilter from 'primevue/keyfilter';

// En main.js
import InputSwitch from 'primevue/inputswitch';
// Estilos (Asegúrate de haber copiado estas carpetas de la plantilla a tu src/assets)
import '@/assets/tailwind.css';
import '@/assets/styles.scss';
import 'primeicons/primeicons.css'; // Iconos obligatorios
import 'primeflex/primeflex.css'; // <--- AGREGAR ESTA LÍNEA

const app = createApp(App);
const pinia = createPinia();

// Middlewares / Plugins
app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark' // Permite el modo oscuro de Sakai
        }
    }
});

// Servicios para mensajes flotantes (Toasts) y diálogos de confirmación
app.use(ToastService);
app.use(ConfirmationService);

app.component('Popover', Popover);
app.component('Toast', Toast);
// ... después de app = createApp(App)
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('Toolbar', Toolbar);

// ... (después de app.use(PrimeVue...))
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Tag', Tag);
app.component('RadioButton', RadioButton);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('InputSwitch', InputSwitch);
// ... después de crear la app
app.directive('keyfilter', KeyFilter);


app.mount('#app');