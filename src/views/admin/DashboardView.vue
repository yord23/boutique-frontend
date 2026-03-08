<template>
    <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Ventas Hoy</span>
                        <div class="text-900 font-bold text-xl">{{ formatCurrency(stats.ventas_hoy) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ stats.pedidos_hoy }} </span>
                <span class="text-500">pedidos nuevos</span>
            </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Utilidad Mes</span>
                        <div class="text-900 font-bold text-xl">{{ formatCurrency(stats.ganancia_mes) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">Neto </span>
                <span class="text-500">estimado</span>
            </div>
        </div>

        <div class="col-12 xl:col-7 mt-4">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Ingresos Semanales</div>
                <Chart type="line" :data="chartData" :options="chartOptions" class="h-20rem" />
            </div>
        </div>

        <div class="col-12 xl:col-5 mt-4">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Distribución de Pagos</div>
                <div class="flex justify-content-center">
                    <Chart type="doughnut" :data="pieData" :options="pieOptions" class="w-full md:w-20rem" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CajaService from '@/services/caja.service';

const stats = ref({ ventas_hoy: 0, pedidos_hoy: 0, ganancia_mes: 0, clientes_nuevos: 0 });
const chartData = ref(null);
const chartOptions = ref(null);
const pieData = ref(null);
const pieOptions = ref(null);

const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const initCharts = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Gráfica de Líneas
    chartData.value = {
        labels: data.lineData.map(d => d.date),
        datasets: [{
            label: 'Ventas ($)',
            data: data.lineData.map(d => d.total),
            fill: false,
            backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
            borderColor: documentStyle.getPropertyValue('--p-primary-500'),
            tension: 0.4
        }]
    };

    chartOptions.value = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColor }, grid: { color: surfaceBorder } },
            y: { ticks: { color: textColor }, grid: { color: surfaceBorder } }
        }
    };

    // Gráfica Circular
    pieData.value = {
        labels: data.pieData.map(m => m.label),
        datasets: [{
            data: data.pieData.map(m => m.value),
            backgroundColor: [
                documentStyle.getPropertyValue('--p-primary-500'),
                documentStyle.getPropertyValue('--p-orange-500'),
                documentStyle.getPropertyValue('--p-cyan-500')
            ]
        }]
    };
    
    pieOptions.value = {
        plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
    };
};

onMounted(async () => {
    try {
        const { data } = await CajaService.getStats();
        stats.value = data.widgets;
        initCharts(data);
    } catch (e) {
        console.error("Error al cargar el Dashboard:", e);
    }
});
</script>