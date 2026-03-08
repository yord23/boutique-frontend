<template>
    <div class="card">
        <h5 class="text-2xl font-bold mb-4">📜 Historial de Cierres de Caja</h5>
        
        <DataTable :value="registros" :paginator="true" :rows="10" 
                   responsiveLayout="scroll" class="p-datatable-sm shadow-1">
            <template #empty> No hay registros de cierres aún. </template>
            
            <Column field="date" header="Fecha" sortable></Column>
            
            <Column header="Cajero">
                <template #body="slotProps">
                    {{ slotProps.data.user ? slotProps.data.user.name : 'N/A' }}
                </template>
            </Column>

            <Column header="Ventas (Efectivo/Tarjeta)">
                <template #body="slotProps">
                    <div class="flex flex-column">
                        <span class="text-green-600 font-bold">💵 {{ formatCurrency(slotProps.data.cash_sales) }}</span>
                        <span class="text-blue-600 font-bold">💳 {{ formatCurrency(slotProps.data.card_sales) }}</span>
                    </div>
                </template>
            </Column>

            <Column header="Utilidad Neta">
                <template #body="slotProps">
                    <span class="font-bold p-2 border-round bg-primary-100 text-primary-900">
                        {{ formatCurrency(slotProps.data.net_profit) }}
                    </span>
                </template>
            </Column>

            <Column header="Diferencia">
                <template #body="slotProps">
                    <Tag :severity="getSeverityDiferencia(slotProps.data.difference)" 
                         :value="formatCurrency(slotProps.data.difference)" />
                </template>
            </Column>

            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" class="p-button-text p-button-rounded" 
                            @click="verDetalles(slotProps.data)" v-tooltip="'Ver detalles'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CajaService from '@/services/caja.service';

const registros = ref([]);

onMounted(async () => {
    try {
        const { data } = await CajaService.historial();
        registros.value = data;
    } catch (error) {
        console.error("Error al cargar historial", error);
    }
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const getSeverityDiferencia = (val) => {
    if (val === 0) return 'success';
    return val < 0 ? 'danger' : 'warning';
};

const verDetalles = (row) => {
    // Aquí podrías abrir un modal con las notas o detalles técnicos
    alert("Notas: " + (row.notes || 'Sin observaciones'));
};
</script>