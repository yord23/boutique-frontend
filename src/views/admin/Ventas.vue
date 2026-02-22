<template>
    <div class="grid">
        <div class="col-12 md:col-8">
            <div class="card">
                <h5>Nueva Venta</h5>
                <div class="p-inputgroup mb-3">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-barcode"></i>
                    </span>
                    <InputText 
                        ref="barcodeInput"
                        v-model="barcodeSearch" 
                        placeholder="Escanear código de barras..." 
                        @keyup.enter="buscarProductoPorCodigo"
                        autofocus
                    />
                </div>
                

                <DataTable :value="carrito" responsiveLayout="scroll" class="p-datatable-sm">
    <template #empty> El carrito está vacío. </template>

    <Column header="Producto">
        <template #body="slotProps">
            <div class="flex flex-column">
                <span class="font-bold text-900">{{ slotProps.data.name }}</span>
                <small class="text-primary font-medium">
                    {{ slotProps.data.variant_info || 'Sin especificaciones' }}
                </small>
            </div>
        </template>
    </Column>

    <Column field="price" header="Precio">
        <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
        </template>
    </Column>

    <Column field="quantity" header="Cant.">
        <template #body="slotProps">
            <InputNumber 
                v-model="slotProps.data.quantity" 
                showButtons 
                buttonLayout="horizontal" 
                :min="1"
                incrementButtonIcon="pi pi-plus" 
                decrementButtonIcon="pi pi-minus"
                inputStyle="width:3rem; text-align: center"
                @update:modelValue="calcularTotales"
            />
        </template>
    </Column>

    <Column header="Subtotal">
        <template #body="slotProps">
            <span class="font-bold">
                {{ formatCurrency(slotProps.data.price * slotProps.data.quantity) }}
            </span>
        </template>
    </Column>

    <Column header="Acciones">
        <template #body="slotProps">
            <Button 
                icon="pi pi-trash" 
                class="p-button-danger p-button-text p-button-rounded" 
                @click="quitarDelCarrito(slotProps.index)" 
            />
        </template>
    </Column>
</DataTable>
            </div>
        </div>

        <div class="col-12 md:col-4">
            <div class="card shadow-2">
                <h4>Resumen</h4>
                <div class="flex justify-content-between mb-3">
                    <span class="text-xl">Total a Pagar:</span>
                    <span class="text-2xl font-bold text-primary">{{ formatCurrency(venta.total) }}</span>
                </div>
                
                <hr />

                <div class="field mt-4">
                    <label>Método de Pago</label>
                    <Dropdown v-model="venta.payment_method" :options="metodosPago" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div class="field">
                    <label>Monto Recibido</label>
                    <InputNumber v-model="venta.received_amount" mode="currency" currency="USD" locale="en-US" class="w-full" @update:modelValue="calcularCambio" />
                </div>

                <div class="field">
                    <label>Cambio (Vuelto)</label>
                    <div class="text-2xl font-bold" :class="venta.change_amount < 0 ? 'text-red-500' : 'text-green-500'">
                        {{ formatCurrency(venta.change_amount) }}
                    </div>
                </div>
                <Button 
    label="Vaciar Carrito" 
    icon="pi pi-trash" 
    class="p-button-text p-button-danger w-full mt-2" 
    @click="limpiarCarrito" 
    :disabled="carrito.length === 0"
/>

                <Button label="FINALIZAR VENTA" icon="pi pi-check" class="w-full p-button-lg mt-3" 
                        :disabled="carrito.length === 0 || venta.change_amount < 0" 
                        @click="procesarVenta" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import ProductoService from '@/services/producto.service'; // Asumiendo que listar está aquí
import VentasService from '@/services/ventas.service';

const toast = useToast();
const barcodeSearch = ref('');
const barcodeInput = ref(null);
const carrito = ref([]);
const venta = ref({
    total: 0,
    received_amount: 0,
    change_amount: 0,
    payment_method: 'cash'
});

const metodosPago = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta', value: 'card' },
    { label: 'Transferencia', value: 'transfer' }
];

const quitarDelCarrito = (index) => {
    carrito.value.splice(index, 1);
    calcularTotales();
    toast.add({ 
        severity: 'info', 
        summary: 'Producto eliminado', 
        detail: 'Se quitó el ítem del carrito', 
        life: 2000 
    });
};
const limpiarCarrito = () => {
    if (carrito.value.length === 0) return;

    // Confirmación opcional (puedes usar un ConfirmDialog de PrimeVue)
    carrito.value = [];
    venta.value = {
        total: 0,
        received_amount: 0,
        change_amount: 0,
        payment_method: 'cash'
    };
    
    toast.add({ 
        severity: 'info', 
        summary: 'Carrito vacío', 
        detail: 'Se han eliminado todos los productos', 
        life: 2000 
    });
    
    // Devolver foco al buscador
    if (barcodeInput.value) barcodeInput.value.$el.focus();
};

const buscarProductoPorCodigo = async () => {
    // Si el buscador está vacío, no hacemos nada
    if (!barcodeSearch.value || barcodeSearch.value.trim() === '') return;
    
    try {
        // Llamamos al servicio usando globalFilter (como definimos en el Controller)
        // Pedimos solo 1 fila para agilizar la respuesta
        const res = await ProductoService.listar({ 
            globalFilter: barcodeSearch.value.trim(), 
            rows: 1 
        });

        // Verificamos si el backend devolvió datos
        const productos = res.data.data || [];
        const producto = productos.length > 0 ? productos[0] : null;

        if (producto) {
            // Buscamos la variante exacta que coincida con el código de barras escaneado
            // Es vital usar .find para separar, por ejemplo, una Talla S de una Talla M
            const varianteExacta = producto.variants.find(v => v.barcode === barcodeSearch.value.trim());
            
            if (varianteExacta) {
                // Enviamos una copia limpia del producto y la variante al carrito
                // Esto evita que cambios en un ítem afecten a otros por referencia de memoria
                const productoCopia = JSON.parse(JSON.stringify(producto));
                const varianteCopia = JSON.parse(JSON.stringify(varianteExacta));
                
                agregarAlCarrito(productoCopia, varianteCopia);
            } else {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Error de variante', 
                    detail: 'El producto existe pero el código no coincide con ninguna variante', 
                    life: 3000 
                });
            }
        } else {
            toast.add({ 
                severity: 'warn', 
                summary: 'No encontrado', 
                detail: `El código "${barcodeSearch.value}" no está registrado`, 
                life: 2000 
            });
        }

        // Limpiamos el input y devolvemos el foco para el siguiente escaneo
        barcodeSearch.value = '';
        
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error de red', 
            detail: 'No se pudo conectar con el servidor', 
            life: 3000 
        });
    }
};
const agregarAlCarrito = (prod, varianteSeleccionada) => {
    // 1. Extraemos el ID de la variante que viene del buscador
    // Asumimos que prod.variants[0] es la que coincide con el código de barras
    const nuevaVarianteId = varianteSeleccionada.id;

    // 2. Buscamos si ESA variante específica ya existe en el carrito
    const itemExistente = carrito.value.find(item => item.product_variant_id === nuevaVarianteId);

    if (itemExistente) {
        // Si ya existe, solo aumentamos la cantidad
        itemExistente.quantity++;
    } else {
        // SI NO EXISTE, creamos una fila NUEVA con sus propios datos
        carrito.value.push({
            product_variant_id: nuevaVarianteId,
            name: prod.name,
            // Si el producto tiene talla/color, es bueno mostrarlo
           variant_info: `${varianteSeleccionada.color?.name || ''} ${varianteSeleccionada.size?.name || ''}`.trim(), 
            // Usamos el precio de la variante si existe, si no, el del producto
            price: parseFloat(varianteSeleccionada.price || prod.base_price),
            quantity: 1
        });
    }
    
    // 3. Recalculamos el total de la venta
    calcularTotales();
};

const calcularTotales = () => {
    venta.value.total = carrito.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    calcularCambio();
};

const calcularCambio = () => {
    venta.value.change_amount = venta.value.received_amount - venta.value.total;
};

const procesarVenta = async () => {
    // Evitar procesar si el carrito está vacío
    if (carrito.value.length === 0) return;

    try {
        const payload = {
            payment_method: venta.value.payment_method,
            received_amount: venta.value.received_amount,
            items: carrito.value
        };
        
        // Enviamos la venta al servidor
        const res = await VentasService.guardar(payload);
        
        // Si el servidor responde con éxito
        if (res.data.status === 'success') {
            toast.add({ 
                severity: 'success', 
                summary: 'Venta exitosa', 
                detail: 'Venta registrada e imprimiendo ticket', 
                life: 3000 
            });

            // 1. Ejecutamos la impresión del ticket
            // Enviamos el número de orden o ID que devuelve Laravel
            imprimirTicket({ 
                order_number: res.data.order_id 
            });

            // 2. Limpiamos el carrito y reseteamos los valores de venta
            limpiarCarrito(); 
        }

    } catch (error) {
        console.error("Error al procesar venta:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.message || 'No se pudo registrar la venta', 
            life: 4000 
        });
    }
};

const imprimirTicket = (datosVenta) => {
    // Creamos una ventana temporal
    const ventanaNueva = window.open('', '_blank', 'width=300,height=600');
    
    // Estructura del Ticket (CSS para impresora térmica)
    const contenidoTicket = `
        <html>
        <head>
            <style>
                body { font-family: 'Courier New', Courier, monospace; width: 280px; font-size: 12px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                hr { border-top: 1px dashed black; }
                table { width: 100%; border-collapse: collapse; }
                .total-section { font-size: 14px; margin-top: 10px; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="text-center">
                <h3 style="margin-bottom:0">MI BOUTIQUE</h3>
                <p style="margin-top:0">Calle Ejemplo 123<br>Tel: 123456789</p>
            </div>
            <p>Ticket: ${datosVenta.order_number}<br>
               Fecha: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th align="left">Desc.</th>
                        <th align="center">Cant.</th>
                        <th align="right">Subt.</th>
                    </tr>
                </thead>
                <tbody>
                    ${carrito.value.map(item => `
                        <tr>
                            <td>${item.name}<br><small>${item.variant_info}</small></td>
                            <td align="center">${item.quantity}</td>
                            <td align="right">${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <hr>
            <div class="total-section">
                <div class="flex justify-between">
                    <span>TOTAL:</span>
                    <span class="bold">${formatCurrency(venta.value.total)}</span>
                </div>
                <div>Recibido: ${formatCurrency(venta.value.received_amount)}</div>
                <div>Cambio: ${formatCurrency(venta.value.change_amount)}</div>
            </div>
            <hr>
            <div class="text-center">
                <p>¡Gracias por su compra!</p>
            </div>
        </body>
        </html>
    `;

    ventanaNueva.document.write(contenidoTicket);
    ventanaNueva.document.close();
};

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
</script>

<style scoped>
.p-inputgroup-addon {
    background-color: var(--primary-color);
    color: white;
}
/* Estilo para que la fila de la variante se vea un poco más discreta */
small {
    display: block;
    margin-top: 0.2rem;
}
</style>