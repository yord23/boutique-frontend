<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        <Button label="Eliminar" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                    </template>
                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="productos"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    lazy
                    :totalRecords="totalRecords"
                    @page="onPage"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0 font-bold">Gestión de Productos</h5>
                            <IconField iconPosition="left" class="mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="buscar" placeholder="Buscar..." @input="listarProductos" />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="id" header="ID" :sortable="true"></Column>
                    <Column field="name" header="Nombre" :sortable="true"></Column>
                    
                    <Column field="categoria_nombre" header="Categoría" :sortable="true"></Column>
                    <Column field="marca_nombre" header="Marca" :sortable="true"></Column>

                    <Column field="base_price" header="Precio" :sortable="true">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.base_price) }}
                        </template>
                    </Column>

                    <Column field="stock" header="Stock" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.stock ?? 0" :severity="getStockSeverity(slotProps.data.stock)" />
                        </template>
                    </Column>
                    <Column field="barcode" header="Código" :sortable="true">
                        <template #body="slotProps">
                            <span class="font-mono text-sm border-1 surface-border border-round px-2 bg-gray-100">
                                {{ slotProps.data.barcode || '---' }}
                            </span>
                        </template>
                    </Column>

                    <Column header="Acciones" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-outlined mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '500px' }" header="Detalles del Producto" :modal="true" class="p-fluid">
                    <div class="field">
                        <label class="font-bold">Nombre</label>
                        <InputText v-model.trim="producto.name" required="true" :class="{ 'p-invalid': submitted && !producto.name }" />
                    </div>
                    <div class="field col">
        <label for="barcode" class="font-bold">Código de Barras</label>
        <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
                <i class="pi pi-barcode"></i>
            </span>
            <InputText id="barcode" v-model="producto.barcode" />
        </div>
    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label class="font-bold">Categoría</label>
                            <Dropdown v-model="producto.category_id" :options="categorias" optionLabel="name" optionValue="id" placeholder="Seleccionar" />
                        </div>
                        <div class="field col">
                            <label class="font-bold">Marca</label>
                            <Dropdown v-model="producto.brand_id" :options="marcas" optionLabel="name" optionValue="id" placeholder="Seleccionar" />
                        </div>
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label class="font-bold">Precio</label>
                            <InputNumber v-model="producto.base_price" mode="currency" currency="USD" locale="en-US" />
                        </div>
                        <div class="field col">
                            <label class="font-bold">Stock</label>
                            <InputNumber v-model="producto.stock" />
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import ProductoService from '@/services/producto.service.js';
import CategoriaService from '@/services/categoria.service.js';
import MarcaService from '@/services/marca.service.js';

const toast = useToast();
const dt = ref();
const productos = ref([]);
const categorias = ref([]);
const marcas = ref([]);
const producto = ref({});
const buscar = ref(''); // Este se enviará como 'q'
const selectedProducts = ref(null);
const productDialog = ref(false);
const submitted = ref(false);
const totalRecords = ref(0);

const listarProductos = async (page = 1) => {
    try {
        // Enviamos 'q' y 'limit' tal como pide tu controlador
        const params = { q: buscar.value, limit: 10, page: page };
        const { data } = await ProductoService.listar(params);
        
        // Laravel paginate devuelve data.data
        productos.value = data.data;
        totalRecords.value = data.total;
    } catch (e) {
        console.error(e);
    }
};

const cargarRelaciones = async () => {
    const [resCat, resMar] = await Promise.all([
        CategoriaService.listar(),
        MarcaService.listar()
    ]);
    categorias.value = resCat.data;
    marcas.value = resMar.data;
};

onMounted(() => {
    listarProductos();
    cargarRelaciones();
});

const getStockSeverity = (stock) => {
    if (!stock || stock <= 0) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
};

const formatCurrency = (val) => val ? val.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : '$0.00';

const onPage = (event) => {
    listarProductos(event.page + 1);
};

const openNew = () => {
    producto.value = { base_price: 0, stock: 0 };
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => { productDialog.value = false; };

const saveProduct = async () => {
    submitted.value = true;
    if (producto.value.name?.trim()) {
        if (producto.value.id) await ProductoService.actualizar(producto.value.id, producto.value);
        else await ProductoService.guardar(producto.value);
        productDialog.value = false;
        listarProductos();
        toast.add({severity:'success', summary: 'Éxito', detail: 'Producto Guardado', life: 3000});
    }
};

const editProduct = (p) => {
    producto.value = { ...p };
    productDialog.value = true;
};

const confirmDeleteSelected = () => { /* implementar lógica */ };
const exportCSV = () => dt.value.exportCSV();
</script>