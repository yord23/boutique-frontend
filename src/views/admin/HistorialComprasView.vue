<template>
    <div class="card">
        <h5>Historial de Compras</h5>
        <DataTable :value="compras" v-model:expandedRows="expandedRows" dataKey="id" responsiveLayout="scroll">
            <template #header>
                <div class="flex justify-content-end">
                    <Button icon="pi pi-refresh" @click="cargarHistorial" />
                </div>
            </template>
            <Column expander style="width: 3rem" />
            <Column field="supplier_name" header="Proveedor"></Column>
            <Column field="created_at" header="Fecha">
                <template #body="slotProps">
                    {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
                </template>
            </Column>
            <Column header="Total">
                <template #body="slotProps">
                    ${{ slotProps.data.total_amount }}
                </template>
            </Column>

            <template #expansion="slotProps">
                <div class="p-3">
                    <h6>Detalle de la compra</h6>
                    <DataTable :value="slotProps.data.items">
                        <Column field="variant.product.name" header="Producto"></Column>
                        <Column field="quantity" header="Cantidad"></Column> 
                        <Column field="cost_price" header="Precio Unitario"></Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import purchaseService  from '@/services/purchase.service';

const compras = ref([]);
const expandedRows = ref({});

const cargarHistorial = async () => {
    const res = await purchaseService.obtenerHistorial();
    compras.value = res.data;
};

onMounted(cargarHistorial);
</script>