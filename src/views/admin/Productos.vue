<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                        <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                    </template>
                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="productos"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    @page="renderTableBarcodes"
                    @sort="renderTableBarcodes"
                    @filter="renderTableBarcodes"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Gestión de Productos</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="id" header="ID" :sortable="true"></Column>
                    <Column field="name" header="Nombre" :sortable="true"></Column>
                    <Column header="Código de Barras">
                        <template #body="slotProps">
                            <div v-if="getBarcode(slotProps.data)" class="flex flex-column align-items-center">
                                <svg :id="'barcode-row-' + slotProps.data.id" style="max-height: 40px; width: 100%;"></svg>
                                <small class="text-color-secondary mt-1">{{ getBarcode(slotProps.data) }}</small>
                            </div>
                            <span v-else class="text-yellow-500 italic">Sin código</span>
                        </template>
                    </Column>

                    <Column header="Imagen">
                       <template #body="slotProps">
        <img 
            v-if="slotProps.data.images && slotProps.data.images.length > 0"
            :src="`http://127.0.0.1:8000/storage/${slotProps.data.images[0].url}`" 
            :alt="slotProps.data.name" 
            class="shadow-2 border-round" 
            style="width: 64px; height: 64px; object-fit: cover;" 
            @error="(e) => e.target.src = 'https://placehold.co/64x64?text=Error+404'"
        />
        <img 
            v-else 
            src="https://placehold.co/64x64?text=Sin+Imagen" 
            class="shadow-2 border-round" 
            style="width: 64px; height: 64px; object-fit: cover;" 
        />
    </template>
                    </Column>

                    <Column field="base_price" header="Precio" :sortable="true">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.base_price) }}
                        </template>
                    </Column>

                    <Column header="Categoría" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.category?.name || 'S/C' }}
                        </template>
                    </Column>

                    <Column header="Inventario" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="getInventoryStatus(slotProps.data)" :severity="getInventorySeverity(slotProps.data)" />
                        </template>
                    </Column>

                    <Column header="Acciones">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <Dialog v-model:visible="productDialog" :style="{ width: '550px' }" header="Detalles del Producto" :modal="true" class="p-fluid">
                <div class="field">
    <label class="mb-3 font-bold">Imagen del Producto</label>
    
    <FileUpload 
        mode="basic" 
        accept="image/*" 
        :maxFileSize="1000000" 
        @select="onUpload" 
        chooseLabel="Cambiar Imagen" 
        severity="secondary" 
        class="p-button-outlined w-full" 
    />

    <div class="mt-3 flex flex-column align-items-center justify-content-center border-1 border-300 border-round p-2 bg-gray-50">
        <span class="text-sm text-secondary mb-2">Vista previa actual:</span>
        
        <img 
            :src="imgPreview || getImageUrl(producto.images?.[0]?.url)" 
            alt="Preview" 
            class="shadow-2 border-round" 
            style="width: 180px; height: 180px; object-fit: cover;" 
            @error="(e) => e.target.src = 'https://placehold.co/180x180?text=Sin+Imagen'"
        />
        
        <Button 
            v-if="imgPreview" 
            label="Quitar selección" 
            icon="pi pi-undo" 
            text 
            severity="danger" 
            class="mt-2 p-button-sm" 
            @click="cancelarNuevaImagen" 
        />
    </div>
</div>

                <div class="field">
                    <label for="name">Nombre</label>
                    <InputText id="name" v-model.trim="producto.name" required="true" :class="{ 'p-invalid': submitted && !producto.name }" />
                    <small class="p-error" v-if="submitted && !producto.name">El nombre es obligatorio.</small>
                </div>
                <div class="field">
    <label for="barcode" class="font-bold">Código de Barras</label>
    <div class="p-inputgroup mb-2">
        <InputText 
            id="barcode" 
            v-model="varianteInicial.barcode" 
            placeholder="Escribe o genera un código" 
            @input="dibujarBarcode" 
        />
        <Button 
            icon="pi pi-refresh" 
            severity="warn" 
            @click="generarBarcode" 
        />
    </div>
    
    <div class="flex justify-content-center bg-white border-round p-2" style="min-height: 60px;" >
        <svg id="barcode-canvas" v-show="varianteInicial.barcode"></svg>
    </div>
</div>
                
                <div class="formgrid grid">
                    <div class="field col">
                        <label>Categoría</label>
                        <Select v-model="producto.category_id" :options="categorias" optionLabel="name" optionValue="id" placeholder="Seleccionar" />
                    </div>
                    <div class="field col">
                        <label>Marca</label>
                        <Select v-model="producto.brand_id" :options="marcas" optionLabel="name" optionValue="id" placeholder="Seleccionar" />
                    </div>
                </div>

                <div class="formgrid grid">
                    <div class="field col">
                        <label>Precio Base</label>
                        <InputNumber v-model="producto.base_price" mode="currency" currency="USD" locale="en-US" />
                    </div>
                    <div class="field col">
                        <label>Proveedor</label>
                        <Select v-model="producto.supplier_id" :options="proveedores" optionLabel="name" optionValue="id" placeholder="Seleccionar" />
                    </div>
                </div>

                <div class="field">
                    <label class="mb-3 font-bold">Variante Inicial (Talla/Color)</label>
                    <div class="formgrid grid">
                        <div class="field col">
                            <Select v-model="varianteInicial.size_id" :options="tallas" optionLabel="name" optionValue="id" placeholder="Talla" />
                        </div>
                        <div class="field col">
                            <Select v-model="varianteInicial.color_id" :options="colores" optionLabel="name" optionValue="id" placeholder="Color" />
                        </div>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveProduct" />
                </template>
            </Dialog>

            <ConfirmDialog></ConfirmDialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import  JsBarcode  from 'jsbarcode';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import ProductoService from '@/services/producto.service';
import CategoriaService from '@/services/categoria.service';
import MarcaService from '@/services/marca.service';
import TallaService from '@/services/talla.service';
import ColorService from '@/services/color.service';
import ProveedorService from '@/services/proveedor.service';

const toast = useToast();
const confirm = useConfirm();
const dt = ref();
const productos = ref([]);
const productDialog = ref(false);
const producto = ref({});
const categorias = ref([]);
const marcas = ref([]);
const tallas = ref([]);
const colores = ref([]);
const proveedores = ref([]);
const selectedProducts = ref();
const submitted = ref(false);

const imageFile = ref(null);
const imgPreview = ref(null);
const varianteInicial = ref({ size_id: null, color_id: null, stock: 1, barcode: '' });

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Función para obtener el barcode de la primera variante
const getBarcode = (product) => {
    const variants = product.variants || product.product_variants || [];
    return variants.length > 0 ? variants[0].barcode : null;
};

// Función para renderizar todos los códigos de la tabla
const renderTableBarcodes = () => {
    nextTick(() => {
        const barcodeFunction = JsBarcode.default || JsBarcode;
        
        productos.value.forEach(prod => {
            const code = getBarcode(prod);
            const elementId = `#barcode-row-${prod.id}`;
            
            if (code && document.querySelector(elementId)) {
                barcodeFunction(elementId, code, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 1.5,
                    height: 30,
                    displayValue: false // No mostramos el texto dentro del SVG para ahorrar espacio
                });
            }
        });
    });
};
// Función para dibujar el código de barras
const dibujarBarcode = () => {
    if (varianteInicial.value.barcode) {
        nextTick(() => {
            // Intentar detectar la función correcta
            const barcodeFunction = JsBarcode.default || JsBarcode;
            
            try {
                barcodeFunction("#barcode-canvas", varianteInicial.value.barcode, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 40,
                    displayValue: true
                });
            } catch (err) {
                console.error("Error al dibujar el código:", err);
            }
        });
    }
};

// Modificamos generarBarcode para que dibuje al terminar
const generarBarcode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    varianteInicial.value.barcode = `BC-${timestamp}${random}`;
    
    dibujarBarcode(); // <--- Dibujamos inmediatamente
};

// Opcional: Si quieres que se dibuje solo al abrir un producto existente
watch(() => varianteInicial.value.barcode, () => {
    if (productDialog.value) dibujarBarcode();
});


const cargarProductos = async () => {
    try {
        const res = await ProductoService.listar();
        productos.value = res.data.data;
        // Esperamos a que Vue dibuje la tabla y luego generamos los códigos
        setTimeout(() => renderTableBarcodes(), 200); 
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
};

const cargarSelectores = async () => {
    try {
        const [resCat, resMar, resTal, resCol, resProv] = await Promise.all([
            CategoriaService.listar(), MarcaService.listar(),
            TallaService.listar(), ColorService.listar(), ProveedorService.listar()
        ]);
        categorias.value = resCat.data.data || resCat.data;
        marcas.value = resMar.data.data || resMar.data;
        tallas.value = resTal.data.data || resTal.data;
        colores.value = resCol.data.data || resCol.data;
        proveedores.value = resProv.data.data || resProv.data;
    } catch (error) { console.error(error); }
};

// Asegúrate de tener esta función para las rutas
const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/64x64?text=Sin+Imagen';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
};
const cancelarNuevaImagen = () => {
    imageFile.value = null;
    imgPreview.value = null; // Al ser null, el <img> volverá a mostrar la imagen del servidor
};

onMounted(() => {
    cargarSelectores();
    cargarProductos();
});

const onUpload = (event) => {
    const file = event.files[0];
    if (file) {
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => { imgPreview.value = e.target.result; };
        reader.readAsDataURL(file);
    }
};

const getTotalStock = (product) => {
    const variants = product.variants || [];
    return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
};

const getInventoryStatus = (product) => {
    const stock = getTotalStock(product);
    if (stock > 10) return 'INSTOCK';
    if (stock > 0) return 'LOWSTOCK';
    return 'OUTOFSTOCK';
};

const getInventorySeverity = (product) => {
    const stock = getTotalStock(product);
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
};

const openNew = () => {
    producto.value = { status: true, base_price: 0 };
    varianteInicial.value = { size_id: null, color_id: null, stock: 1, barcode: '' };
    imgPreview.value = null;
    imageFile.value = null;
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;
    if (producto.value.name?.trim()) {
        // SEGURIDAD: Si el barcode sigue vacío, generamos uno antes de enviar
        if (!varianteInicial.value.barcode || varianteInicial.value.barcode.trim() === "") {
            generarBarcode();
        }
        try {
            const formData = new FormData();
            
            formData.append('name', producto.value.name);
            formData.append('category_id', producto.value.category_id);
            formData.append('brand_id', producto.value.brand_id);
            formData.append('supplier_id', producto.value.supplier_id);
            formData.append('base_price', producto.value.base_price);
            formData.append('status', producto.value.status ? 1 : 0);
            formData.append('description', producto.value.description || '');

            const variantsArray = [{
                size_id: varianteInicial.value.size_id,
                color_id: varianteInicial.value.color_id,
                stock: varianteInicial.value.stock,
                barcode: varianteInicial.value.barcode,
                price: producto.value.base_price
            }];
            
            formData.append('variants', JSON.stringify(variantsArray));

            // CRÍTICO: Adjuntar imagen si existe
            if (imageFile.value) {
                formData.append('image', imageFile.value);
            }

            // DEBUG: Ver qué se está enviando realmente
            console.log("Enviando FormData...");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ', pair[1]);
            }

            if (producto.value.id) {
                formData.append('_method', 'PUT');
                await ProductoService.modificar(producto.value.id, formData);
            } else {
                await ProductoService.guardar(formData);
            }

            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado', life: 3000 });
            productDialog.value = false;
            await cargarProductos();
        } catch (error) {
            console.error("Error en el servidor:", error.response?.data);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto', life: 3000 });
        }
    }
};

const editProduct = (prod) => {
    producto.value = { ...prod };
    // IMPORTANTE: Limpiar previsualizaciones de archivos anteriores
    imageFile.value = null;
    imgPreview.value = null;
    // Cargar variantes si existen
    const variants = prod.variants || [];
    if (variants.length > 0) {
        varianteInicial.value = { ...variants[0] };
    }
    //imgPreview.value = prod.images?.[0]?.url || null;
    productDialog.value = true;
    setTimeout(() => {
        dibujarBarcode();
    }, 150);
};

const confirmDeleteProduct = (prod) => {
    confirm.require({
        message: `¿Eliminar ${prod.name}?`,
        header: 'Confirmar',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await ProductoService.eliminar(prod.id);
                await cargarProductos();
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 });
            } catch (error) {
                console.error(error);
            }
        }
    });
};

const formatCurrency = (value) => {
    return value ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00';
};
</script>