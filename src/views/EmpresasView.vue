<script setup lang="ts">
import { useEmpresasStore } from '@/stores/empresasStore';
import { onMounted, ref } from 'vue';
import type { Empresa } from '@/types';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Header from '@/components/Header.vue';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from 'primevue/useconfirm';

const empresasStore = useEmpresasStore()
const confirm = useConfirm()

const showEmpresaDialog = ref(false)
const editingEmpresaId = ref<number | null>(null)

// Formulario de empresa
const empresaForm = ref({
  rut: '',
  razon_social: '',
  nombre_fantasia: '',
  logo_empresa: '',
  estado_empresa: 'activo' as 'activo' | 'inactivo',
})

const estadoOptions = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
]

function openCreateEmpresaDialog() {
  editingEmpresaId.value = null
  empresaForm.value = {
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    logo_empresa: '',
    estado_empresa: 'activo',
  }
  showEmpresaDialog.value = true
}

function openEditEmpresaDialog(empresa: Empresa) {
  editingEmpresaId.value = empresa.id
  empresaForm.value = {
    rut: empresa.rut || '',
    razon_social: empresa.razon_social || '',
    nombre_fantasia: empresa.nombre_fantasia || '',
    logo_empresa: empresa.logo_empresa || '',
    estado_empresa: (empresa.estado_empresa as 'activo' | 'inactivo') || 'activo',
  }
  showEmpresaDialog.value = true
}

function closeEmpresaDialog() {
  showEmpresaDialog.value = false
  editingEmpresaId.value = null
  empresaForm.value = {
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    logo_empresa: '',
    estado_empresa: 'activo',
  }
}

async function handleSaveEmpresa() {
  if (!empresaForm.value.rut || !empresaForm.value.razon_social || !empresaForm.value.nombre_fantasia) {
    alert('RUT, razón social y nombre fantasía son requeridos')
    return
  }

  try {
    if (editingEmpresaId.value) {
      await empresasStore.updateEmpresa(editingEmpresaId.value, {
        rut: empresaForm.value.rut,
        razon_social: empresaForm.value.razon_social,
        nombre_fantasia: empresaForm.value.nombre_fantasia,
        logo_empresa: empresaForm.value.logo_empresa || null,
        estado_empresa: empresaForm.value.estado_empresa,
      })
      alert('Empresa actualizada correctamente')
    } else {
      await empresasStore.createEmpresa({
        rut: empresaForm.value.rut,
        razon_social: empresaForm.value.razon_social,
        nombre_fantasia: empresaForm.value.nombre_fantasia,
        logo_empresa: empresaForm.value.logo_empresa || null,
        estado_empresa: empresaForm.value.estado_empresa,
      })
      alert('Empresa creada correctamente')
    }
    closeEmpresaDialog()
    await empresasStore.loadEmpresas()
  } catch (err: any) {
    alert(`Error: ${err.message || 'Error al guardar la empresa'}`)
  }
}

function handleDeleteEmpresa(empresa: Empresa) {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar la empresa "${empresa.nombre_fantasia}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await empresasStore.deleteEmpresa(empresa.id)
        alert('Empresa eliminada correctamente')
        await empresasStore.loadEmpresas()
      } catch (err: any) {
        alert(`Error: ${err.message || 'Error al eliminar la empresa'}`)
      }
    },
  })
}

onMounted(async () => {
  await empresasStore.loadEmpresas()
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <Header />
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Empresas</h1>
          <p class="text-sm text-muted-foreground">Gestiona las empresas del sistema.</p>
        </div>
        <Button
          label="Crear Empresa"
          icon="pi pi-plus"
          @click="openCreateEmpresaDialog"
        />
      </div>

      <div class="px-6 py-6">
        <div class="relative">
          <div
            v-if="empresasStore.loading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg border"
          >
            <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
          </div>
          <DataTable
            v-if="empresasStore.empresas.length > 0"
            :value="empresasStore.empresas"
            :loading="empresasStore.loading"
            class="rounded-lg border bg-card text-sm"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[10, 25, 50]"
            sortMode="multiple"
          >
            <Column field="rut" header="RUT" sortable>
              <template #body="{ data }">
                <span class="font-medium">{{ data.rut || '-' }}</span>
              </template>
            </Column>
            <Column field="razon_social" header="Razón Social" sortable>
              <template #body="{ data }">
                {{ data.razon_social || '-' }}
              </template>
            </Column>
            <Column field="nombre_fantasia" header="Nombre Fantasía" sortable>
              <template #body="{ data }">
                {{ data.nombre_fantasia || '-' }}
              </template>
            </Column>
            <Column field="estado_empresa" header="Estado" sortable>
              <template #body="{ data }">
                <span
                  :class="data.estado_empresa === 'activo' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'"
                >
                  {{ data.estado_empresa === 'activo' ? 'Activo' : 'Inactivo' }}
                </span>
              </template>
            </Column>
            <Column field="created_at" header="Fecha Creación" sortable>
              <template #body="{ data }">
                {{ data.created_at ? new Date(data.created_at).toLocaleDateString('es-ES') : '-' }}
              </template>
            </Column>
            <Column header="Acciones" :exportable="false">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="openEditEmpresaDialog(data)"
                    v-tooltip.top="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    @click="handleDeleteEmpresa(data)"
                    v-tooltip.top="'Eliminar'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div
            v-else-if="!empresasStore.loading && empresasStore.empresas.length === 0"
            class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            No hay empresas registradas. Crea una nueva empresa para comenzar.
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showEmpresaDialog"
      modal
      :header="editingEmpresaId ? 'Editar Empresa' : 'Crear Empresa'"
      :style="{ width: '600px' }"
      @hide="closeEmpresaDialog"
    >
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="rut-input" class="block text-sm font-medium">
            RUT <span class="text-destructive">*</span>
          </label>
          <InputText
            id="rut-input"
            v-model="empresaForm.rut"
            placeholder="Ej: 77149001-K"
            class="w-full"
            :disabled="!!editingEmpresaId"
          />
          <p class="text-xs text-muted-foreground">
            El RUT debe ser único y no se puede modificar después de crear la empresa
          </p>
        </div>

        <div class="space-y-2">
          <label for="razon-social-input" class="block text-sm font-medium">
            Razón Social <span class="text-destructive">*</span>
          </label>
          <InputText
            id="razon-social-input"
            v-model="empresaForm.razon_social"
            placeholder="Razón social de la empresa"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="nombre-fantasia-input" class="block text-sm font-medium">
            Nombre Fantasía <span class="text-destructive">*</span>
          </label>
          <InputText
            id="nombre-fantasia-input"
            v-model="empresaForm.nombre_fantasia"
            placeholder="Nombre comercial de la empresa"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="logo-input" class="block text-sm font-medium">Logo (URL)</label>
          <InputText
            id="logo-input"
            v-model="empresaForm.logo_empresa"
            placeholder="URL del logo de la empresa (opcional)"
            class="w-full"
          />
          <p class="text-xs text-muted-foreground">
            URL o ruta del logo de la empresa
          </p>
        </div>

        <div class="space-y-2">
          <label for="estado-select" class="block text-sm font-medium">Estado</label>
          <Select
            id="estado-select"
            v-model="empresaForm.estado_empresa"
            :options="estadoOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona un estado"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeEmpresaDialog"
        />
        <Button
          :label="editingEmpresaId ? 'Actualizar' : 'Crear'"
          @click="handleSaveEmpresa"
          :disabled="!empresaForm.rut || !empresaForm.razon_social || !empresaForm.nombre_fantasia"
        />
      </template>
    </Dialog>

    <ConfirmPopup />
  </div>
</template>
