<template>
    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="font-bold text-2xl m-0">Registro de Actividad (Auditoría)</h2>
            <Button icon="pi pi-refresh" rounded outlined @click="cargarDatos" :loading="loading" />
        </div>

        <DataTable :value="logs" :paginator="true" :rows="10" 
                   :loading="loading"
                   responsiveLayout="stack" breakpoint="960px"
                   class="p-datatable-gridlines"
                   sortField="created_at" :sortOrder="-1">
            
            <template #empty> 
                <div class="p-4 text-center">No se encontraron registros de actividad.</div>
            </template>
            
            <Column field="created_at" header="Fecha/Hora" sortable>
                <template #body="slotProps">
                    {{ formatearFecha(slotProps.data.created_at) }}
                </template>
            </Column>
            
            <Column field="user.name" header="Usuario" sortable>
                <template #body="slotProps">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-user text-primary"></i>
                        <span class="font-medium">{{ slotProps.data.user?.name || 'Sistema' }}</span>
                    </div>
                </template>
            </Column>
            
            <Column field="action" header="Acción">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.action" :severity="getSeverity(slotProps.data.action)" />
                </template>
            </Column>
            
            <Column field="description" header="Detalles"></Column>
            
            <Column field="ip_address" header="Dirección IP">
                <template #body="slotProps">
                    <code class="text-xs text-600">{{ slotProps.data.ip_address }}</code>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Importamos tu nuevo servicio amigable
import AuditoriaService from '@/services/auditoria.service';

const logs = ref([]);
const loading = ref(false);

const cargarDatos = async () => {
    loading.value = true;
    try {
        const { data } = await AuditoriaService.getLogs();
        logs.value = data;
    } catch (error) {
        console.error("Error cargando logs:", error);
    } finally {
        loading.value = false;
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getSeverity = (action) => {
    if (action.includes('LOGIN')) return 'success';
    if (action.includes('ELIMINAR') || action.includes('BORRAR')) return 'danger';
    if (action.includes('CAMBIO') || action.includes('EDITAR')) return 'warning';
    return 'info';
};

onMounted(() => {
    cargarDatos();
});
</script>