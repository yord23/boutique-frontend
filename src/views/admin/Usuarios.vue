<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                        <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
                    </template>

                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="usuarios"
                    v-model:selection="selectedUsers"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Gestión de Usuarios</h5>
                            <IconField iconPosition="left" class="mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="buscar" placeholder="Buscar..." @input="listarUsuarios" />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="id" header="ID" :sortable="true" style="min-width: 4rem"></Column>
                    <Column field="name" header="Nombre" :sortable="true" style="min-width: 12rem"></Column>
                    <Column field="email" header="Correo" :sortable="true" style="min-width: 12rem"></Column>
                    <!--Column field="phone" header="Teléfono" :sortable="true" style="min-width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.phone || 'Sin teléfono' }}
                        </template>
                    </Column-->

                    <Column field="phone" header="Teléfono" style="min-width: 10rem">
    <template #body="slotProps">
        <div class="flex align-items-center">
            <i class="pi pi-phone mr-2 text-primary"></i>
            <span>{{ slotProps.data.phone }}</span>
        </div>
    </template>
</Column>
                    <Column field="role" header="Rol" :sortable="true" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.role" :severity="getRoleSeverity(slotProps.data.role)" />
                        </template>
                    </Column>
                    <Column field="is_active" header="Estado" style="min-width: 8rem">
                        <template #body="slotProps">
                            <i class="pi" :class="slotProps.data.is_active ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'"></i>
                        </template>
                    </Column>
                    <Column :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>

           <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Detalles del Usuario" :modal="true" class="p-fluid">
    <div class="field">
        <label for="name" class="font-bold">Nombre</label>
        <InputText id="name" v-model.trim="usuario.name" required="true" autofocus :class="{ 'p-invalid': submitted && !usuario.name }" placeholder="Ej. Juan Pérez" v-keyfilter="{ pattern: /^[a-zA-Z\s]*$/ }" 
                />
        <small class="p-error" v-if="submitted && !usuario.name">El nombre es obligatorio.</small>
    </div>

    <div class="field">
        <label for="email" class="font-bold">Correo Electrónico</label>
        <InputText id="email" v-model.trim="usuario.email" required="true" placeholder="juan@ejemplo.com" />
    </div>

    <div class="field" v-if="!usuario.id">
        <label for="password" class="font-bold">Contraseña</label>
        <Password id="password" v-model="usuario.password" :feedback="false" toggleMask placeholder="********" />
    </div>

    <div class="field">
        <label class="mb-3 font-bold">Rol del Usuario</label>
        <div class="formgrid grid">
            <div class="field-radiobutton col-6">
                <RadioButton id="role1" name="role" value="admin" v-model="usuario.role" />
                <label for="role1">Administrador</label>
            </div>
            <div class="field-radiobutton col-6">
                <RadioButton id="role2" name="role" value="vendedor" v-model="usuario.role" />
                <label for="role2">Vendedor</label>
            </div>
        </div>
    </div>

    <div class="formgrid grid">
        <div class="field col">
            <label for="phone" class="font-bold">Teléfono</label>
            <InputText id="phone" v-model="usuario.phone" v-keyfilter.num />
        </div>
        <div class="field col">
            <label for="status" class="font-bold">Estado</label>
            <div class="flex align-items-center mt-2">
                <InputSwitch v-model="usuario.is_active" />
                <span class="ml-2">{{ usuario.is_active ? 'Activo' : 'Inactivo' }}</span>
            </div>
        </div>
    </div>

    <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveUser" severity="success" />
    </template>
</Dialog>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import usuarioService from '@/services/usuario.service';

const toast = useToast();
const dt = ref();
const usuarios = ref([]);
const usuario = ref({});
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const selectedUsers = ref(null);
const buscar = ref('');
const submitted = ref(false);
const loading = ref(false);

const listarUsuarios = async () => {
    loading.value = true;
    try {
        const { data } = await usuarioService.listar(buscar.value);
        usuarios.value = data;
    } finally {
        loading.value = false;
    }
};

onMounted(() => { listarUsuarios(); });

const openNew = () => {
    usuario.value = { role: 'vendedor', is_active: true };
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => { userDialog.value = false; submitted.value = false; };

const editUser = (prod) => {
    usuario.value = { ...prod };
    userDialog.value = true;
};

const saveUser = async () => {
    submitted.value = true;
    if (usuario.value.name?.trim()) {
        try {
            if (usuario.value.id) {
                await usuarioService.modificar(usuario.value.id, usuario.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado', life: 3000 });
            } else {
                await usuarioService.guardar(usuario.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Creado', life: 3000 });
            }
            userDialog.value = false;
            listarUsuarios();
        } catch (e) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar', life: 3000 });
        }
    }
};

const confirmDeleteUser = (u) => { usuario.value = u; deleteUserDialog.value = true; };

const deleteUser = async () => {
    await usuarioService.eliminar(usuario.value.id);
    deleteUserDialog.value = false;
    listarUsuarios();
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Borrado', life: 3000 });
};

const exportCSV = () => { dt.value.exportCSV(); };

const getRoleSeverity = (role) => {
    switch (role) {
        case 'admin': return 'danger';
        case 'vendedor': return 'success';
        default: return 'info';
    }
};
</script>