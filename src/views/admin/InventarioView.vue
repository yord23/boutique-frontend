<template>
    <div class="card">
        <h5>Reporte de Inventario Actual</h5>
        
        <DataTable 
            :value="inventario" 
            :paginator="true" 
            :rows="10" 
            responsiveLayout="scroll"
            stripedRows
        >
            <Column field="producto" header="Producto" :sortable="true"></Column>
            <Column field="codigo" header="Código/Barcode"></Column>
            <Column field="talla" header="Talla"></Column>
            <Column field="color" header="Color"></Column>
            <Column field="stock" header="Stock" :sortable="true">
                <template #body="slotProps">
                    <span :class="{'text-red-500 font-bold': slotProps.data.stock <= 5}">
                        {{ slotProps.data.stock }}
                        <i v-if="slotProps.data.stock <= 5" class="pi pi-exclamation-triangle ml-2"></i>
                    </span>
                </template>
            </Column>
            <Column field="precio" header="Precio Unitario">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.precio) }}
                </template>
            </Column>
            <Column field="total_valor" header="Valor Total">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.total_valor) }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import productService from '@/services/producto.service';

const inventario = ref([]);

const cargarInventario = async () => {
    try {
        const res = await productService.obtenerReporteInventario();
        inventario.value = res.data;
    } catch (error) {
        console.error("Error al cargar inventario:", error);
    }
};

const formatCurrency = (v) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
};

onMounted(cargarInventario);
</script>