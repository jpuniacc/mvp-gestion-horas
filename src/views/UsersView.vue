<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Select from 'primevue/select';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from 'primevue/useconfirm';
import { useEmpresasStore } from '@/stores/empresasStore';
import { useUsersStore } from '@/stores/usersStore';
import type { Profile } from '@/types';
import Header from '@/components/Header.vue';

const empresasStore = useEmpresasStore();
const usersStore = useUsersStore();
const selectedEmpresaRut = ref<string>('');
const showEditUserDialog = ref(false);
const showCreateUserDialog = ref(false);
const editingUserId = ref<string | null>(null);
const confirm = useConfirm();

const empresaOptions = computed(() => empresasStore.empresas ?? []);

const roleOptions = ['admin', 'pm', 'ops'];

const editUserForm = ref({
  full_name: '',
  role: '',
  is_active: true,
});

const createUserForm = ref({
  email: '',
  full_name: '',
  role: '',
});

onMounted(async () => {
  if (empresasStore.empresas.length === 0) {
    await empresasStore.loadEmpresas();
  }
});

watch(selectedEmpresaRut, async (newEmpresaRut) => {
  if (newEmpresaRut) {
    await empresasStore.getUsersEmpresa(newEmpresaRut);
  } else {
    empresasStore.profiles = [];
  }
});

function openEditUserDialog(profile: Profile) {
  editingUserId.value = profile.id;
  editUserForm.value = {
    full_name: profile.full_name || '',
    role: profile.role || '',
    is_active: profile.is_active ?? true,
  };
  showEditUserDialog.value = true;
}

function closeEditUserDialog() {
  showEditUserDialog.value = false;
  editingUserId.value = null;
  editUserForm.value = {
    full_name: '',
    role: '',
    is_active: true,
  };
}

async function handleUpdateUser() {
  if (!editingUserId.value) {
    return;
  }

  try {
    await empresasStore.updateProfile({
      id: editingUserId.value,
      full_name: editUserForm.value.full_name,
      role: editUserForm.value.role,
      is_active: editUserForm.value.is_active,
    });
    closeEditUserDialog();
    // Recargar los usuarios de la empresa
    if (selectedEmpresaRut.value) {
      await empresasStore.getUsersEmpresa(selectedEmpresaRut.value);
    }
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
  }
}

function handleDeleteUser(event: Event, profile: Profile) {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `¿Desea quitar a ${profile.full_name} de la empresa?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    rejectClass: 'p-button-danger',
    accept: () => {
      // TODO: Implementar lógica para quitar usuario de la empresa
      console.log('Eliminar usuario:', profile.id);
    },
  });
}

function openCreateUserDialog() {
  createUserForm.value = {
    email: '',
    full_name: '',
    role: '',
  };
  showCreateUserDialog.value = true;
}

function closeCreateUserDialog() {
  showCreateUserDialog.value = false;
  createUserForm.value = {
    email: '',
    full_name: '',
    role: '',
  };
}

async function handleCreateUser() {
  if (!createUserForm.value.email || !createUserForm.value.full_name || !createUserForm.value.role) {
    return;
  }

  if (!selectedEmpresaRut.value) {
    console.error('Debe seleccionar una empresa');
    return;
  }

  try {
    const result = await usersStore.createUser(
      createUserForm.value.email,
      createUserForm.value.full_name,
      selectedEmpresaRut.value,
      createUserForm.value.role
    );

    if (result.success) {
      closeCreateUserDialog();
      // Recargar los usuarios de la empresa
      await empresasStore.getUsersEmpresa(selectedEmpresaRut.value);
    } else {
      console.error('Error al crear usuario:', result.error);
    }
  } catch (err) {
    console.error('Error al crear usuario:', err);
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <Header />
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div
        class="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold">Usuarios</h1>
          <p class="text-sm text-muted-foreground">Selecciona una empresa para gestionar usuarios.</p>
        </div>
      </div>

      <div class="px-6 py-6 space-y-4">
        <div class="flex items-center gap-4">
          <div class="space-y-2 max-w-md flex-1">
            <label for="empresa-select" class="block text-sm font-medium">Empresa</label>
            <Select
              id="empresa-select"
              v-model="selectedEmpresaRut"
              :options="empresaOptions"
              optionLabel="razon_social"
              optionValue="rut"
              placeholder="Selecciona una empresa"
              class="w-full"
              :loading="empresasStore.loading"
            >
              <template #option="slotProps">
                <div class="flex flex-col text-sm leading-tight">
                  <span class="font-medium">{{ slotProps.option.razon_social }}</span>
                  <span class="text-xs text-muted-foreground">{{ slotProps.option.rut }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <div
          v-if="!empresasStore.loading && empresaOptions.length === 0"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          No hay empresas disponibles. Intenta recargar más tarde.
        </div>

        <div class="flex justify-end mb-4">
          <Button
            label="Crear Usuario"
            icon="pi pi-plus"
            @click="openCreateUserDialog"
            :disabled="!selectedEmpresaRut"
          />
        </div>

        <div class="relative">
          <div
            v-if="empresasStore.loading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg border"
          >
            <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
          </div>
          <DataTable
            v-if="selectedEmpresaRut && empresasStore.profiles.length > 0"
            :value="empresasStore.profiles"
            :loading="empresasStore.loading"
            class="rounded-lg border bg-card"
          >
            <Column field="full_name" header="Nombre Completo" sortable>
              <template #body="{ data }">
                {{ data.full_name || '-' }}
              </template>
            </Column>
            <Column field="role" header="Rol" sortable>
              <template #body="{ data }">
                {{ data.role || '-' }}
              </template>
            </Column>
            <Column field="is_active" header="Activo" sortable>
              <template #body="{ data }">
                <span :class="data.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ data.is_active ? 'Sí' : 'No' }}
                </span>
              </template>
            </Column>
            <Column header="Acciones">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i
                    class="pi pi-pencil cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    @click="openEditUserDialog(data)"
                    title="Editar"
                  />
                  <i
                    class="pi pi-trash cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                    @click="(event) => handleDeleteUser(event, data)"
                    title="Eliminar"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div
            v-else-if="selectedEmpresaRut && !empresasStore.loading && empresasStore.profiles.length === 0"
            class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            No hay usuarios disponibles para esta empresa.
          </div>
          <div
            v-else-if="!selectedEmpresaRut"
            class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            Selecciona una empresa para ver sus usuarios.
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showEditUserDialog"
      modal
      header="Editar Usuario"
      :style="{ width: '500px' }"
      @hide="closeEditUserDialog"
    >
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="user-name-input" class="block text-sm font-medium">Nombre Completo</label>
          <InputText
            id="user-name-input"
            v-model="editUserForm.full_name"
            placeholder="Nombre completo del usuario"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="user-role-select" class="block text-sm font-medium">Rol</label>
          <Select
            id="user-role-select"
            v-model="editUserForm.role"
            :options="roleOptions"
            placeholder="Selecciona un rol"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="user-active-toggle" class="block text-sm font-medium">Activo</label>
            <ToggleSwitch
              id="user-active-toggle"
              v-model="editUserForm.is_active"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Los usuarios inactivos no podrán acceder al sistema
          </p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeEditUserDialog"
        />
        <Button
          label="Actualizar"
          @click="handleUpdateUser"
          :disabled="!editUserForm.full_name || !editUserForm.role"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showCreateUserDialog"
      modal
      header="Crear Usuario"
      :style="{ width: '500px' }"
      @hide="closeCreateUserDialog"
    >
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="create-user-email-input" class="block text-sm font-medium">Email</label>
          <InputText
            id="create-user-email-input"
            v-model="createUserForm.email"
            type="email"
            placeholder="usuario@example.com"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="create-user-name-input" class="block text-sm font-medium">Nombre Completo</label>
          <InputText
            id="create-user-name-input"
            v-model="createUserForm.full_name"
            placeholder="Nombre completo del usuario"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="create-user-role-select" class="block text-sm font-medium">Rol</label>
          <Select
            id="create-user-role-select"
            v-model="createUserForm.role"
            :options="roleOptions"
            placeholder="Selecciona un rol"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeCreateUserDialog"
        />
        <Button
          label="Crear"
          @click="handleCreateUser"
          :disabled="!createUserForm.email || !createUserForm.full_name || !createUserForm.role"
          :loading="usersStore.loading"
        />
      </template>
    </Dialog>

    <ConfirmPopup />
  </div>
</template>

<style scoped>
</style>