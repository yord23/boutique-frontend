<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button label="Nuevo Usuario" v-if="hasPermission('usuarios.crear')" outlined rounded icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                        <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
                    </template>

                    <template #end>
                        <Button label="Exportar CSV" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
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
                            <h5 class="m-0">Gestión de Personal</h5>
                            <IconField iconPosition="left" class="mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="buscar" placeholder="Buscar por nombre..." @input="listarUsuarios" />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="id" header="ID" :sortable="true" style="min-width: 4rem"></Column>
                    <Column field="name" header="Nombre" :sortable="true" style="min-width: 12rem"></Column>
                    <Column field="email" header="Correo" :sortable="true" style="min-width: 12rem"></Column>
                    
                    <Column field="phone" header="Teléfono" style="min-width: 10rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <i class="pi pi-phone mr-2 text-primary text-xs"></i>
                                <span>{{ slotProps.data.phone || 'N/A' }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="role" header="Rol" :sortable="true" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.role.toUpperCase()" :severity="getRoleSeverity(slotProps.data.role)" />
                        </template>
                    </Column>

                    <Column field="is_active" header="Estado" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.is_active ? 'ACTIVO' : 'INACTIVO'" 
                                 :severity="slotProps.data.is_active ? 'success' : 'danger'" rounded />
                        </template>
                    </Column>

                    <Column :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil"  outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
                            <Button v-if="hasPermission('usuarios.eliminar')" icon="pi pi-trash"  outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Detalles del Usuario" :modal="true" class="p-fluid">
                <div class="field">
                    <label for="name" class="font-bold">Nombre Completo</label>
                    <InputText id="name" v-model.trim="usuario.name" required="true" autofocus :class="{ 'p-invalid': submitted && !usuario.name }" />
                    <small class="p-error" v-if="submitted && !usuario.name">El nombre es obligatorio.</small>
                </div>

                <div class="field">
                    <label for="email" class="font-bold">Correo Electrónico</label>
                    <InputText id="email" v-model.trim="usuario.email" required="true" :class="{ 'p-invalid': submitted && !usuario.email }" />
                </div>

                <div class="field">
                    <label for="password" class="font-bold">Contraseña {{ usuario.id ? '(Dejar en blanco para no cambiar)' : '' }}</label>
                    <Password id="password" v-model="usuario.password" :feedback="!usuario.id" toggleMask placeholder="********" />
                </div>

                <div class="field">
    <label for="role" class="mb-3 font-bold">Asignar Rol</label>
    <Select 
        id="role" 
        v-model="usuario.role" 
        :options="listaRoles" 
        optionLabel="name" 
        optionValue="name" 
        placeholder="Seleccione un Rol" 
        :class="{ 'p-invalid': submitted && !usuario.role }"
    >
        <template #option="slotProps">
            <Tag :value="slotProps.option.name.toUpperCase()" :severity="getRoleSeverity(slotProps.option.name)" />
        </template>
    </Select>
    <small class="p-error" v-if="submitted && !usuario.role">El rol es obligatorio.</small>
</div>
                <div class="field mt-4">
    <label class="font-bold mb-3 block">Permisos Manuales (Opcional)</label>
    <div class="grid">
        <div v-for="permiso in todosLosPermisos" :key="permiso.id" class="col-12 md:col-6 lg:col-4">
            <div class="flex align-items-center">
                <Checkbox 
                    v-model="usuario.permissions_list" 
                    :inputId="'permiso_' + permiso.id" 
                    name="permisos" 
                    :value="permiso.name" 
                    :disabled="tienePermisoPorRol(permiso.name)"
                />
                <label :for="'permiso_' + permiso.id" :class="{'font-bold text-primary': tienePermisoPorRol(permiso.name)}">
                    {{ permiso.name }} {{ tienePermisoPorRol(permiso.name) ? '(Incluido en Rol)' : '' }}
                </label>
            </div>
        </div>
    </div>
</div>

                <div class="formgrid grid">
                    <div class="field col">
                        <label for="phone" class="font-bold">Teléfono</label>
                        <InputText id="phone" v-model="usuario.phone" />
                    </div>
                    <div class="field col">
                        <label for="status" class="font-bold">Estado de Cuenta</label>
                        <div class="flex align-items-center mt-2">
                            <InputSwitch v-model="usuario.is_active" />
                            <span class="ml-2 font-medium" :class="usuario.is_active ? 'text-green-500' : 'text-red-500'">
                                {{ usuario.is_active ? 'Habilitado' : 'Suspendido' }}
                            </span>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar Usuario" icon="pi pi-check" @click="saveUser" severity="success" />
                </template>
            </Dialog>

            <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirmar Acción" :modal="true">
                <div class="flex align-items-center justify-content-center">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span v-if="usuario">¿Estás seguro de que deseas eliminar a <b>{{ usuario.name }}</b>?</span>
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                    <Button label="Sí, Eliminar" icon="pi pi-check" severity="danger" @click="deleteUser" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import usuarioService from '@/services/usuario.service';
import { hasPermission as checkPerm } from '@/utils/permisos';
import roleService from '@/services/role.service'; // <--- Importamos el service de roles para cargar los roles en el formulario

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


// Exponemos la función al template
const hasPermission = (p) => checkPerm(p);

// Agrega esta función en tu script
const tienePermisoPorRol = (nombrePermiso) => {
    const rolSeleccionado = listaRoles.value.find(r => r.name === usuario.value.role);
    if (!rolSeleccionado) return false;
    return rolSeleccionado.permissions.some(p => p.name === nombrePermiso);
};

const listarUsuarios = async () => {
    loading.value = true;
    try {
        const { data } = await usuarioService.listar(buscar.value);
        usuarios.value = data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const todosLosPermisos = ref([]);

const listaRoles = ref([]); // Nueva variable para almacenar los roles de la DB

const cargarRolesSistema = async () => {
    try {
        // Usamos el servicio de roles que creamos antes
        const { data } = await roleService.listar(); 
        listaRoles.value = data;
    } catch (e) {
        console.error("Error al cargar roles:", e);
    }
};
// Función para obtener la lista de permisos desde la API
const cargarPermisosSistema = async () => {
    try {
        const res = await usuarioService.getPermisos();
        // Verificamos si la data existe antes de asignar
        todosLosPermisos.value = res.data || [];
        console.log("Permisos cargados:", todosLosPermisos.value);
    } catch (e) {
        // Si e.response no existe, mostramos el error genérico
        console.error("Error al cargar permisos:", e.response?.data || e.message);
        toast.add({ 
            severity: 'error', 
            summary: 'Error de Conexión', 
            detail: 'No se pudo conectar con la API de permisos', 
            life: 3000 
        });
    }
};
onMounted(() => { 
    listarUsuarios();
    cargarPermisosSistema(); // <--- Llamamos a la función aquí
    cargarRolesSistema(); // <--- Agregamos esta llamada
});

const openNew = () => {
    usuario.value = { role: 'vendedor', is_active: true,permissions_list: [] }; // Valores por defecto para un nuevo usuario
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => { 
    userDialog.value = false; 
    submitted.value = false; 
};

const editUser = (user) => {
    // Si el backend envía los permisos dentro del objeto user:
    // Mapeamos para tener solo los NOMBRES en un array simple
    const permisosActuales = user.permissions ? user.permissions.map(p => p.name) : [];

    usuario.value = { 
        ...user, 
        is_active: !!user.is_active,
        permissions_list: permisosActuales // <--- Esto activará los Checkboxes
    };
    userDialog.value = true;
};

const saveUser = async () => {
    submitted.value = true;
    
    if (usuario.value.name?.trim() && usuario.value.email?.trim()) {
        loading.value = true;
        try {
            if (usuario.value.id) {
                await usuarioService.modificar(usuario.value.id, usuario.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente', life: 3000 });
            } else {
                await usuarioService.guardar(usuario.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Nuevo usuario registrado', life: 3000 });
            }
            userDialog.value = false;
            listarUsuarios();
        } catch (e) {
            const errorMsg = e.response?.data?.mensaje || 'Error al procesar la solicitud';
            toast.add({ severity: 'error', summary: 'Error', detail: errorMsg, life: 4000 });
        } finally {
            loading.value = false;
        }
    }
};

const confirmDeleteUser = (u) => { 
    usuario.value = u; 
    deleteUserDialog.value = true; 
};

const deleteUser = async () => {
    try {
        await usuarioService.eliminar(usuario.value.id);
        deleteUserDialog.value = false;
        listarUsuarios();
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 });
    }
};

const exportCSV = () => { dt.value.exportCSV(); };

const getRoleSeverity = (role) => {
    switch (role) {
        case 'admin': return 'danger';
        case 'almacenista': return 'info';
        case 'vendedor': return 'success';
        default: return 'info';
    }
};


</script>