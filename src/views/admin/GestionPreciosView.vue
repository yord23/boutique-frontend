<template>
    <div class="card">
        <h5>Gestión de Precios y Rentabilidad</h5>
        <p class="mb-4">Haz clic sobre un valor de <b>Costo</b> o <b>Precio</b> para editarlo y presiona Enter.</p>
        
        <DataTable :value="productos" editMode="cell" @cell-edit-complete="onCellEditComplete" class="editable-cells-table" responsiveLayout="scroll">
            <Column field="producto" header="Producto" style="width:30%"></Column>
            <Column field="variante" header="Talla/Color" style="width:20%"></Column>
            
            <Column field="costo" header="Costo Unitario" style="width:15%">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.costo) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="USD" locale="en-US" autofocus />
                </template>
            </Column>

            <Column field="precio_venta" header="Precio Venta" style="width:15%">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.precio_venta) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="USD" locale="en-US" autofocus />
                </template>
            </Column>

            <Column header="Margen %" style="width:20%">
                <template #body="slotProps">
                    <Tag :severity="getSeverity(slotProps.data.margen)" :value="slotProps.data.margen + '%'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import productService from '@/services/producto.service';

const productos = ref([]);

const cargarDatos = async () => {
    const res = await productService.obtenerPrecios();
    // Mapeamos los datos para que el DataTable los entienda fácil
    productos.value = res.data.map(item => ({
        id: item.id,
        producto: item.product.name,
        variante: `${item.size?.name || '-'} / ${item.color?.name || '-'}`,
        costo: parseFloat(item.cost_price) || 0,
        precio_venta: parseFloat(item.price) || 0,
        margen: calcularMargen(item.cost_price, item.price)
    }));
};

const calcularMargen = (costo, venta) => {
    if (!venta || venta <= 0) return 0;
    return (((venta - costo) / venta) * 100).toFixed(2);
};

const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;

    // Actualizar localmente
    data[field] = newValue;
    data.margen = calcularMargen(data.costo, data.precio_venta);

    // Enviar al servidor
    try {
        await productService.actualizarPrecio(data.id, {
            price: data.precio_venta,
            cost_price: data.costo
        });
    } catch (error) {
        console.error("Error al guardar:", error);
    }
};

const getSeverity = (margen) => {
    if (margen >= 30) return 'success';
    if (margen >= 15) return 'warning';
    return 'danger';
};

const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

onMounted(cargarDatos);
</script>