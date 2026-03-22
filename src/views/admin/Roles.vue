<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo Rol" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    </template>
                </Toolbar>

                <DataTable :value="roles" :loading="loading" dataKey="id" :paginator="true" :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles">
                    
                    <Column field="id" header="ID" style="width: 5rem"></Column>
                    <Column field="name" header="Nombre del Rol" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.name.toUpperCase()" severity="info" />
                        </template>
                    </Column>
                    
                    <Column header="Permisos Asignados">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Chip v-for="p in slotProps.data.permissions" :key="p.id" :label="p.name" class="text-xs" />
                                <span v-if="slotProps.data.permissions.length === 0" class="text-muted-color italic text-sm">Sin permisos</span>
                            </div>
                        </template>
                    </Column>

                    <Column :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" outlined rounded severity="danger" 
                                @click="confirmDeleteRole(slotProps.data)" 
                                :disabled="slotProps.data.name === 'admin'" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <Dialog v-model:visible="roleDialog" :style="{ width: '500px' }" header="Detalles del Rol" :modal="true" class="p-fluid">
                <div class="field">
                    <label for="name" class="font-bold">Nombre del Rol</label>
                    <InputText id="name" v-model.trim="rol.name" required="true" autofocus 
                        :class="{ 'p-invalid': submitted && !rol.name }" placeholder="Ej: Supervisor, Cajero..." />
                    <small class="p-error" v-if="submitted && !rol.name">El nombre es obligatorio.</small>
                </div>

                <div class="field mt-4">
                    <label class="font-bold mb-3 block">Asignar Permisos al Rol</label>
                    <div class="grid">
                        <div v-for="permiso in todosLosPermisos" :key="permiso.id" class="col-12 md:col-6">
                            <div class="flex align-items-center">
                                <Checkbox v-model="rol.permissions" :inputId="'p_' + permiso.id" :value="permiso.name" />
                                <label :for="'p_' + permiso.id" class="ml-2">{{ permiso.name }}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" text @click="roleDialog = false" />
                    <Button label="Guardar Rol" icon="pi pi-check" severity="success" @click="saveRole" :loading="saving" />
                </template>
            </Dialog>

            <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                <div class="flex align-items-center justify-content-center">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span v-if="rol">¿Estás seguro de eliminar el rol <b>{{ rol.name }}</b>?</span>
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
                    <Button label="Sí, Eliminar" icon="pi pi-check" severity="danger" @click="deleteRole" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import roleService from '@/services/role.service'; // <--- Importa el nuevo service

const toast = useToast();
const roles = ref([]);
const todosLosPermisos = ref([]);
const rol = ref({ name: '', permissions: [] });
const roleDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const loading = ref(false);
const saving = ref(false);

const cargarDatos = async () => {
    loading.value = true;
    try {
        // Usamos el service
        const resRoles = await roleService.listar();
        const resPermisos = await roleService.getPermisos();
        roles.value = resRoles.data;
        todosLosPermisos.value = resPermisos.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openNew = () => {
    rol.value = { name: '', permissions: [] };
    submitted.value = false;
    roleDialog.value = true;
};

const saveRole = async () => {
    submitted.value = true;
    if (!rol.value.name) return;

    saving.value = true;
    try {
        // Usamos el service para guardar
        await roleService.guardar(rol.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente', life: 3000 });
        roleDialog.value = false;
        cargarDatos();
    } catch (e) {
        const msg = e.response?.data?.mensaje || 'Error al guardar';
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
    } finally {
        saving.value = false;
    }
};

const confirmDeleteRole = (r) => {
    rol.value = r;
    deleteDialog.value = true;
};

const deleteRole = async () => {
    try {
        await roleService.eliminar(rol.value.id);
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Rol eliminado con éxito', life: 3000 });
        deleteDialog.value = false;
        cargarDatos();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el rol', life: 3000 });
    }
};

onMounted(cargarDatos);
</script>