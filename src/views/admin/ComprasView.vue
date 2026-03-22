<template>
    <div class="card">
        <h5 class="mb-4">Registrar Entrada de Mercancía</h5>

        <div class="formgrid grid mb-4">
            <div class="field col-12 md:col-6">
                <label class="block mb-2">Proveedor</label>
                <InputText v-model="form.supplier_name" class="w-full" placeholder="Ej: Distribuidora X" />
            </div>
        </div>

        <div class="field mb-4">
            <label class="block mb-2">Buscar producto por nombre o código</label>
            <AutoComplete 
                v-model="productoBuscado" 
                :suggestions="resultadosBusqueda" 
                @complete="buscarProducto" 
                @item-select="agregarAlCarrito"
                placeholder="Escribe el nombre o código de barras..." 
                class="w-full"
            >
                <template #item="slotProps">
                    <div>
                        {{ slotProps.item.product.name }} - {{ slotProps.item.barcode }} 
                        ({{ slotProps.item.size?.name || '-' }} / {{ slotProps.item.color?.name || '-' }})
                    </div>
                </template>
            </AutoComplete>
        </div>

        <DataTable :value="form.items" responsiveLayout="scroll">
            <Column field="product.name" header="Producto"></Column>
            <Column header="Variante">
                <template #body="slotProps">
                    {{ slotProps.data.size?.name }} / {{ slotProps.data.color?.name }}
                </template>
            </Column>
            <Column header="Cantidad">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.qty" :min="1" />
                </template>
            </Column>
            <Column header="Costo Unitario">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.cost" mode="currency" currency="USD" />
                </template>
            </Column>
            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="quitarItem(slotProps.index)" />
                </template>
            </Column>
        </DataTable>

        <div class="flex justify-content-end mt-4">
            <h4 class="mr-4">Total: {{ formatCurrency(totalCompra) }}</h4>
            <Button label="Registrar Compra" icon="pi pi-check" @click="registrar" :disabled="form.items.length === 0" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import purchaseService  from '@/services/purchase.service';

const form = ref({ supplier_name: '', items: [] });
const productoBuscado = ref(null);
const resultadosBusqueda = ref([]);

const buscarProducto = async (event) => {
    const res = await purchaseService.buscarProductos(event.query);
    resultadosBusqueda.value = res.data;
};

const agregarAlCarrito = (event) => {
    const item = event.value;
    // Evitar duplicados si quieres, o simplemente añadir
    form.value.items.push({
        variant_id: item.id,
        product: item.product,
        size: item.size,
        color: item.color,
        qty: 1,
        cost: parseFloat(item.price) || 0
    });
    productoBuscado.value = null; // Limpiar buscador
};

const quitarItem = (index) => form.value.items.splice(index, 1);

const totalCompra = computed(() => {
    return form.value.items.reduce((acc, item) => acc + (item.qty * item.cost), 0);
});

const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const registrar = async () => {
    try {
        await purchaseService.registrar(form.value);
        alert('¡Compra registrada! El stock se ha actualizado.');
        form.value = { supplier_name: '', items: [] }; // Reset
    } catch (err) {
        console.error(err);
    }
};
</script>