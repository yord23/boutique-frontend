<template>
    <div class="grid">
        <div class="col-12 lg:col-4">
            <div class="card shadow-2">
                <h4 class="text-center mb-4">💰 Registro de Abonos</h4>

                <div class="field mb-4">
                    <label class="font-bold">Seleccionar Cliente</label>
                    <Select 
                        v-model="selectedCustomer" 
                        :options="clientes" 
                        optionLabel="name" 
                        placeholder="Buscar cliente..." 
                        filter 
                        class="w-full"
                        @change="onCustomerSelect"
                    />
                </div>

                <div v-if="selectedCustomer" class="p-4 border-round mb-4 bg-primary-reverse shadow-1 text-center">
                    <span class="block text-500 font-medium mb-2">SALDO PENDIENTE ACTUAL</span>
                    <div class="text-3xl font-bold" :class="selectedCustomer.debt > 0 ? 'text-red-500' : 'text-green-500'">
                        {{ formatCurrency(selectedCustomer.debt) }}
                    </div>
                </div>

                <div v-if="selectedCustomer && selectedCustomer.debt > 0">
                    <div class="field">
                        <label for="monto" class="font-bold">Monto a Abonar</label>
                        <InputNumber 
                            id="monto" 
                            v-model="form.amount" 
                            mode="currency" 
                            currency="USD" 
                            locale="en-US" 
                            class="w-full"
                            :max="Number(selectedCustomer.debt)"
                        />
                    </div>

                    <div class="field">
                        <label class="font-bold">Método de Pago</label>
                        <Dropdown 
                            v-model="form.payment_method" 
                            :options="metodosPago" 
                            optionLabel="label" 
                            optionValue="value" 
                            class="w-full" 
                        />
                    </div>

                    <div class="field">
                        <label class="font-bold">Notas</label>
                        <Textarea v-model="form.notes" rows="2" class="w-full" placeholder="Detalles del pago..." />
                    </div>

                    <Button 
                        label="REGISTRAR ABONO" 
                        icon="pi pi-save" 
                        class="w-full p-button-success mt-3" 
                        :loading="loading"
                        :disabled="!form.amount || form.amount <= 0"
                        @click="guardarAbono" 
                    />
                </div>

                <div v-else-if="selectedCustomer && selectedCustomer.debt <= 0" class="text-center p-4">
                    <i class="pi pi-check-circle text-green-500 text-5xl mb-3"></i>
                    <p class="font-bold text-green-600">Cliente sin deudas.</p>
                </div>
            </div>
        </div>

        <div class="col-12 lg:col-8">
            <div class="card shadow-2">
                <h5 class="mb-3"><i class="pi pi-history mr-2"></i>Historial de Pagos</h5>
                
                <DataTable :value="historialAbonos" responsiveLayout="scroll" :rows="10" paginator class="p-datatable-sm">
                    <template #empty> 
                        <div class="text-center p-3">
                            {{ selectedCustomer ? 'No hay abonos registrados para este cliente.' : 'Seleccione un cliente para ver su historial.' }}
                        </div>
                    </template>
                    
                    <Column field="date" header="Fecha">
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.date).toLocaleDateString() }}
                        </template>
                    </Column>
                    
                    <Column field="amount" header="Monto">
                        <template #body="slotProps">
                            <span class="font-bold text-green-600">{{ formatCurrency(slotProps.data.amount) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="payment_method" header="Método">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.payment_method.toUpperCase()" severity="info" />
                        </template>
                    </Column>
                    
                    <Column field="notes" header="Notas"></Column>
                    <Column header="Ticket" style="width: 5rem">
                        <template #body="slotProps">
                            <Button 
                                icon="pi pi-print" 
                                class="p-button-rounded p-button-text p-button-plain" 
                                @click="imprimirTicket(slotProps.data)" 
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import ClienteService from '@/services/cliente.service';
import AbonoService from '@/services/abono.service';

const toast = useToast();
const loading = ref(false);
const clientes = ref([]);
const selectedCustomer = ref(null);
const historialAbonos = ref([]);

const form = ref({
    customer_id: null,
    amount: 0,
    payment_method: 'cash',
    notes: ''
});

const metodosPago = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia', value: 'transfer' },
    { label: 'Tarjeta', value: 'card' }
];

const cargarClientes = async () => {
    try {
        const { data } = await ClienteService.obtenerTodos();
        clientes.value = data;
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
};

const cargarHistorial = async (clienteId) => {
    try {
        const { data } = await AbonoService.obtenerHistorialPorCliente(clienteId);
        historialAbonos.value = data;
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
};

const onCustomerSelect = (event) => {
    if (event.value) {
        form.value.customer_id = event.value.id;
        form.value.amount = 0;
        // Forzamos que la deuda sea tratada como número para evitar el error del componente
        selectedCustomer.value.debt = Number(event.value.debt);
        cargarHistorial(event.value.id);
    } else {
        historialAbonos.value = [];
    }
};

const guardarAbono = async () => {
    loading.value = true;
    try {
        const res = await AbonoService.registrarAbono(form.value);
        
        if (res.data.status === 'success') {
            toast.add({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Abono registrado correctamente', 
                life: 3000 
            });
            
            // Actualizar deuda localmente y recargar historial
            selectedCustomer.value.debt = res.data.new_debt;
            await cargarHistorial(form.value.customer_id);
            // --- NUEVO: Preguntar si desea imprimir ---
            if (confirm("¿Desea imprimir el comprobante?")) {
                imprimirTicket(res.data.abono);
            }
            // Limpiar solo el monto y notas, mantener el cliente seleccionado
            form.value.amount = 0;
            form.value.notes = '';
        }
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.message || 'Error al procesar', 
            life: 4000 
        });
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};
const imprimirTicket = (datos) => {
    const fecha = new Date(datos.date).toLocaleString();
    const ventana = window.open('', '_blank', 'width=600,height=600');
    
    ventana.document.write(`
        <html>
            <head>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 10px; }
                    .text-center { text-align: center; }
                    .bold { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <h2 style="margin:0">MI NEGOCIO</h2>
                    <p>Comprobante de Abono</p>
                </div>
                <div class="divider"></div>
                <p><span class="bold">Fecha:</span> ${fecha}</p>
                <p><span class="bold">Cliente:</span> ${selectedCustomer.value.name}</p>
                <div class="divider"></div>
                <table>
                    <tr>
                        <td class="bold">MONTO ABONADO:</td>
                        <td style="text-align:right">${formatCurrency(datos.amount)}</td>
                    </tr>
                    <tr>
                        <td class="bold">SALDO RESTANTE:</td>
                        <td style="text-align:right">${formatCurrency(selectedCustomer.value.debt)}</td>
                    </tr>
                </table>
                <div class="divider"></div>
                <p><span class="bold">Método:</span> ${datos.payment_method.toUpperCase()}</p>
                ${datos.notes ? `<p><span class="bold">Nota:</span> ${datos.notes}</p>` : ''}
                <br>
                <p class="text-center">¡Gracias por su pago!</p>
            </body>
        </html>
    `);

    ventana.document.close();
    ventana.print();
    ventana.close();
};
onMounted(cargarClientes);
</script>