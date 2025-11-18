<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { useProjectsStore } from '@/stores/projectsStore';
import { useTimesheetStore } from '@/stores/timesheetStore';
import { onMounted, ref, watch } from 'vue';
import Select from '@/components/ui/Select.vue';
import Label from '@/components/ui/Label.vue';
import TimesheetGrid from '@/components/timesheet/TimesheetGrid.vue';

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const timesheetStore = useTimesheetStore()
const selectedProjectId = ref<string>('')

onMounted(async () => {
  await projectsStore.loadProjects()
});

async function handleProjectChange(projectId: string) {
  if (!projectId) return
  
  await timesheetStore.loadEntries2Approved(projectId)
  console.log('entries2Approved:', timesheetStore.entries2Approved)
}

watch(selectedProjectId, async (newProjectId) => {
  await handleProjectChange(newProjectId)
})

</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Aprobaciones</h1>
    <p class="text-muted-foreground">Esta funcionalidad será implementada en la Fase 2</p>
    
    <div class="space-y-2">
      <Label for="project-select">Seleccionar Proyecto</Label>
      <Select
        id="project-select"
        v-model="selectedProjectId"
        placeholder="Selecciona un proyecto"
      >
        <option
          v-for="project in projectsStore.projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }} ({{ project.code }})
        </option>
      </Select>
    </div>
    <div class="space-y-2">
      
    </div>
  </div>

</template>

