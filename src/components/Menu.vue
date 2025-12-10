<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue';
import MenuBar from 'primevue/menubar';

const authStore = useAuthStore()
const items = ref([
    {
        label: 'Mi Timesheet',
        to: '/timesheet/week',
        roles: ['admin', 'pm', 'ops']
    },
    {
        label: 'Aprobaciones',
        to: '/approvals',
        roles: ['admin', 'pm']
    },
    {
        label: 'Mantenedores',
        roles: ['admin'],
        items: [
            {
                label: 'Proyectos',
                to: '/projects',
            },
            {
                label: 'Usuarios',
                to: '/users',
            },
            {
                label: 'Empresas',
                to: '/empresas',
            }
        ]
    }
])
</script>


<template>
    <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">Timesheet MVP</h1>
        <MenuBar :model="items">
            <template #item="{ item, props, hasSubmenu }">
                <router-link v-if="item.roles?.includes(authStore.profile?.role)" :to="item.to">
                    <a v-ripple>
                        <span>{{ item.label }}</span>
                    </a>
                </router-link>
            </template>
        </MenuBar>
    </div>
</template>
<style scoped></style>