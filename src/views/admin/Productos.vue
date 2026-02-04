<template>
    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nuevo" icon="pi pi-plus" class="p-button-success mr-2" @click="abrirModal" />
            </template>
        </Toolbar>

        <DataTable :value="productos" :paginator="true" :rows="10" 
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
            responsiveLayout="scroll">
            
            <Column field="id" header="ID" sortable style="width: 5%"></Column>
            <Column field="name" header="Nombre" sortable style="width: 25%"></Column>
            
            <Column field="category.name" header="Categoría" sortable style="width: 15%"></Column>
            <Column field="brand.name" header="Marca" sortable style="width: 15%"></Column>
            
            <Column field="base_price" header="Precio" sortable style="width: 15%">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.base_price) }}
                </template>
            </Column>

            <Column header="Acciones" style="width: 15%">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editarProducto(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmarEliminar(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="productDialog" :style="{width: '450px'}" header="Detalles del Producto" :modal="true" class="p-fluid">
            <div class="field">
                <label for="name">Nombre</label>
                <InputText id="name" v-model.trim="producto.name" required="true" :class="{'p-invalid': enviado && errores.name}" />
                <small class="p-error" v-if="enviado && errores.name">{{ errores.name }}</small>
            </div>

            <div class="field">
                <label for="description">Descripción</label>
                <Textarea id="description" v-model="producto.description" rows="3" />
            </div>

            <div class="formgrid grid">
                <div class="field col">
                    <label>Categoría</label>
                    <Dropdown v-model="producto.category_id" :options="listas.categorias" optionLabel="name" optionValue="id" placeholder="Seleccione" :class="{'p-invalid': enviado && errores.category_id}" />
                    <small class="p-error" v-if="enviado && errores.category_id">{{ errores.category_id }}</small>
                </div>
                <div class="field col">
                    <label>Marca</label>
                    <Dropdown v-model="producto.brand_id" :options="listas.marcas" optionLabel="name" optionValue="id" placeholder="Seleccione" :class="{'p-invalid': enviado && errores.brand_id}" />
                    <small class="p-error" v-if="enviado && errores.brand_id">{{ errores.brand_id }}</small>
                </div>
            </div>

            <div class="field">
                <label for="price">Precio Base</label>
                <InputNumber id="price" v-model="producto.base_price" mode="currency" currency="USD" locale="en-US" :class="{'p-invalid': enviado && errores.base_price}" />
                <small class="p-error" v-if="enviado && errores.base_price">{{ errores.base_price }}</small>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cerrarModal"/>
                <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="guardarProducto" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import ProductoService from '@/services/producto.service';
import CategoriaService from '@/services/categoria.service';
import MarcaService from '@/services/marca.service';

const toast = useToast();
const confirm = useConfirm();

const productos = ref([]);
const productDialog = ref(false);
const enviado = ref(false);
const errores = ref({});

const producto = ref({
    id: null,
    name: '',
    description: '',
    category_id: null,
    brand_id: null,
    size: '',
    color: '',
    supplier_id: 1,
    base_price: 0
});

const listas = ref({ categorias: [], marcas: [] });

const cargarDatos = async () => {
    try {
        const [p, c, m] = await Promise.all([
            ProductoService.listar(),
            CategoriaService.listar(),
            MarcaService.listar()
        ]);
        productos.value = p.data;
        listas.value.categorias = c.data;
        listas.value.marcas = m.data;
    } catch (error) {
        console.error(error);
        toast.add({severity:'error', summary: 'Error', detail: 'No se cargaron los datos', life: 3000});
    }
};

onMounted(() => cargarDatos());

const validar = () => {
    errores.value = {};
    if (!producto.value.name?.trim()) errores.value.name = "El nombre es obligatorio.";
    if (!producto.value.category_id) errores.value.category_id = "Elegir categoría.";
    if (!producto.value.brand_id) errores.value.brand_id = "Elegir marca.";
    if (producto.value.base_price <= 0) errores.value.base_price = "Precio inválido.";
    return Object.keys(errores.value).length === 0;
};

const abrirModal = () => {
    producto.value = { id: null, name: '', description: '', category_id: null, brand_id: null, supplier_id: 1, base_price: 0 };
    enviado.value = false;
    productDialog.value = true;
};

const cerrarModal = () => {
    productDialog.value = false;
    enviado.value = false;
};

const editarProducto = (prod) => {
    producto.value = { ...prod };
    productDialog.value = true;
};

const guardarProducto = async () => {
    enviado.value = true;
    if (!validar()) return;

    try {
        if (producto.value.id) {
            await ProductoService.actualizar(producto.value.id, producto.value);
            toast.add({severity:'success', summary: 'Éxito', detail: 'Actualizado', life: 3000});
        } else {
            await ProductoService.guardar(producto.value);
            toast.add({severity:'success', summary: 'Éxito', detail: 'Creado', life: 3000});
        }
        productDialog.value = false;
        cargarDatos();
    } catch (error) {
        toast.add({severity:'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000});
    }
};

const confirmarEliminar = (prod) => {
    confirm.require({
        message: `¿Eliminar ${prod.name}?`,
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí',
        rejectLabel: 'No',
        accept: async () => {
            await ProductoService.eliminar(prod.id);
            cargarDatos();
            toast.add({severity:'success', summary: 'Éxito', detail: 'Eliminado', life: 3000});
        }
    });
};

const formatCurrency = (value) => value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
</script>