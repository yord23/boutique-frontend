<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                        <Button label="Imprimir Etiquetas" icon="pi pi-print" class="p-button-secondary" @click="imprimirEtiquetas" :disabled="!productos || !productos.length" />
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
                    lazy
                    :paginator="true"
                    :rows="lazyParams.rows"
                    :totalRecords="totalRecords"
                    :loading="loading"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    :filters="filters"
                    @page="onPage"
                    @sort="onPage"
                    @filter="onPage"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Gestión de Productos</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." @input="onFilter" />
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
            :src="getImageUrl(slotProps.data.images[0].url) + '?t=' + slotProps.data.updated_at_timestamp" 
            loading="lazy"
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
        :disabled="isUploading" 
    />

    <div class="mt-3 flex flex-column align-items-center justify-content-center border-1 border-300 border-round p-2 bg-gray-50">
        
        <div class="image-container">
            <div v-if="isUploading" class="spinner-overlay">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" />
            </div>
        <!--span class="text-sm text-secondary mb-2">Vista previa actual:</span-->
        
        <img 
            :src="imgPreview || getImageUrl(producto.images?.[0]?.url)" 
            alt="Preview" 
            class="shadow-2 border-round" 
            style="width: 180px; height: 180px; object-fit: cover;" 
            @error="(e) => e.target.src = 'https://placehold.co/180x180?text=Sin+Imagen'"
        />
        </div>
        <Button 
            v-if="imgPreview && !isUploading" 
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
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" :disabled="isUploading"/>
                    <Button label="Guardar" icon="pi pi-check" @click="saveProduct" :loading="isUploading"/>
                </template>
            </Dialog>

            <ConfirmDialog></ConfirmDialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import  JsBarcode  from 'jsbarcode';
import {jsPDF} from 'jspdf';
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
const isUploading = ref(false);
const loading = ref(false);

// Agrega esto a tus refs
const totalRecords = ref(0);
const lazyParams = ref({ page: 0, rows: 5, sortField: null, 
    sortOrder: null }); // PrimeVue usa índice 0 para la primera página

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

        const barcodeFunction = JsBarcode.default || JsBarcode;
        // Optimizamos: Buscamos solo los SVGs que existen actualmente en el DOM de la tabla
        const barcodeElements = document.querySelectorAll('svg[id^="barcode-row-"]');

        barcodeElements.forEach(svg => {
            // Extraemos el ID del producto directamente del ID del elemento SVG
            const productId = svg.id.replace('barcode-row-', '');
            
            // Buscamos el producto en nuestra lista local
            const prod = productos.value.find(p => p.id == productId);
            const code = getBarcode(prod);
            
            if (code) {
                try {
                    barcodeFunction(svg, code, {
                        format: "CODE128",
                        lineColor: "#000",
                        width: 1.2, // Un poco más delgado para mejorar rendimiento
                        height: 25,  // Altura optimizada
                        displayValue: false,
                        flat: true // Mejora la velocidad de renderizado en listas largas
                    });
                } catch (err) {
                    console.error(`Error renderizando barcode para producto ${productId}:`, err);
                }
            }
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

// En tu <script setup>
let searchTimeout = null;

// Observar el filtro global
watch(() => filters.value['global'].value, (newValue) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        // Reiniciamos a la página 0 cuando se busca algo nuevo
        lazyParams.value.page = 0; 
        cargarProductos();
    }, 500); // Espera 500ms después de que el usuario deje de escribir
});
const cargarProductos = async () => {
    loading.value = true;
    try {
        // Preparamos los parámetros para Laravel
        const params = {
            page: (lazyParams.value.page || 0) + 1, // Laravel empieza en página 1
            rows: lazyParams.value.rows || 5,
            globalFilter: filters.value['global'].value
        };
        const res = await ProductoService.listar(params);
        productos.value = res.data.data;
        totalRecords.value = res.data.total
        // Esperamos a que Vue dibuje la tabla y luego generamos los códigos
       // Usamos un tiempo mínimo para asegurar que PrimeVue monte el componente DataTable
        // Renderizamos códigos de barras después de que Vue actualice el DOM
        nextTick(() => {
            setTimeout(() => {
                renderTableBarcodes();
                loading.value = false;
            }, 150);
        });
    } catch (error) {
        loading.value = false;
        console.error("Error cargando productos:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos', life: 3000 });
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
    if (!url) return 'https://placehold.co/180x180?text=Sin+Imagen';
    // Si ya es una URL completa (como una preview base64 o link externo)
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // URL limpia de Laravel
    return `http://127.0.0.1:8000/storage/${url.replace('public/', '')}`;
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
        isUploading.value = true; // <--- Indicamos que estamos subiendo
        // SEGURIDAD: Si el barcode sigue vacío, generamos uno antes de enviar
        if (!varianteInicial.value.barcode) generarBarcode();             generarBarcode();
    
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
                id: varianteInicial.value.id || null,
                size_id: varianteInicial.value.size_id,
                color_id: varianteInicial.value.color_id,
                stock: varianteInicial.value.stock || 0,
                barcode: varianteInicial.value.barcode,
                price: producto.value.base_price
            }];
            
            formData.append('variants', JSON.stringify(variantsArray));

            // CRÍTICO: Adjuntar imagen si existe
            if (imageFile.value) {
                formData.append('image', imageFile.value);
            }


            if (producto.value.id) {
                formData.append('_method', 'PUT');
                await ProductoService.actualizar(producto.value.id, formData);
            } else {
                await ProductoService.guardar(formData);
            }

            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado', life: 3000 });
            productDialog.value = false;
            await cargarProductos();
            // Cache buster para refrescar la imagen en la tabla
            productos.value = productos.value.map(p => {
                if (p.images && p.images.length > 0) {
                    const separator = p.images[0].url.includes('?') ? '&' : '?';
                    p.images[0].url += `${separator}t=${new Date().getTime()}`;
                }
                return p;
                updated_at_timestamp: Date.now()
            });
        } catch (error) {
            console.error("Error en el servidor:", error);
            // Extraer el mensaje de error real de Laravel
            if (error.response && error.response.status === 422) {
                // Si hay errores de validación (ej. barcode duplicado)
               const validationErrors = error.response.data.errors;

               // Recorremos los errores y mostramos un Toast por cada uno
                Object.keys(validationErrors).forEach((key) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error de Validación',
                        detail: validationErrors[key][0], // El primer mensaje de error del campo
                        life: 5000
                    });
                });
                // errorDetalle = Object.values(error.response.data.errors).flat()[0];
            } else {
                // Error genérico para otros fallos (500, 404, etc.)
                toast.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: error.response?.data?.message || 'No se pudo procesar la solicitud', 
                    life: 3000 
                });
            }
            
            //toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto', life: 3000 });
        }finally {
            isUploading.value = false; // <--- Terminamos de subir
        }
    }
};

const editProduct = (prod) => {
    submitted.value = false;
    // IMPORTANTE: Limpiar previsualizaciones de archivos anteriores
    imageFile.value = null;
    imgPreview.value = null;
    producto.value = { ...prod };
    // Cargar variantes si existen
    const variants = prod.variants || prod.product_variants || [];
    if (variants.length > 0) {
        varianteInicial.value = { ...variants[0] };
    }else {
        varianteInicial.value = { size_id: null, color_id: null, stock: 1, barcode: '' };
    }
    //imgPreview.value = prod.images?.[0]?.url || null;
    productDialog.value = true;
    setTimeout(() => {
        dibujarBarcode();
    }, 200);
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

const onPage = (event) => {
    lazyParams.value = event; // Asegúrate de definir lazyParams como ref
    cargarProductos(); // Esto ya llama a renderTableBarcodes por dentro
};

const imprimirEtiquetas = () => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Configuración de la cuadrícula
    const etiquetasPorFila = 3;
    const anchoEtiqueta = 60;
    const altoEtiqueta = 40;
    const margenX = 10;
    const margenY = 15;

    productos.value.forEach((prod, index) => {
        const code = getBarcode(prod);
        if (!code) return;

        // Calcular posición X e Y
        const fila = Math.floor((index % (etiquetasPorFila * 6)) / etiquetasPorFila); 
        const columna = index % etiquetasPorFila;
        
        const x = margenX + (columna * anchoEtiqueta);
        const y = margenY + (fila * altoEtiqueta);

        // 1. Dibujar Nombre del Producto
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(prod.name.toUpperCase().substring(0, 25), x + 5, y);

        // 2. Crear un canvas invisible para generar el barcode limpio
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, code, {
            format: "CODE128",
            displayValue: true,
            fontSize: 12,
            width: 2,
            height: 50
        });

        // 3. Convertir canvas a imagen y añadir al PDF
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', x + 2, y + 2, 50, 20);

        // Manejo de nueva página (si hay más de 18 etiquetas, por ejemplo)
        if ((index + 1) % 18 === 0 && index !== productos.value.length - 1) {
            doc.addPage();
        }
    });

    doc.save(`etiquetas_${new Date().getTime()}.pdf`);
};

</script>

<style scoped>
.image-container {
    position: relative;
    width: 180px;
    height: 180px;
}

.spinner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}
</style>