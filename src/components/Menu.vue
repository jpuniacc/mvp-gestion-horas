<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue';
import MenuBar from 'primevue/menubar';

const authStore = useAuthStore()

// Estructura del menú con soporte para submenús y roles
interface MenuItem {
    label: string;
    to?: string;
    roles?: string[];
    items?: MenuItem[];
    icon?: string;
}

const menuItems: MenuItem[] = [
    {
        label: 'Mi Timesheet',
        to: '/timesheet/week',
        roles: ['admin', 'pm', 'ops', 'user']
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
                roles: ['admin']
            },
            {
                label: 'Usuarios',
                to: '/users',
                roles: ['admin']
            },
            {
                label: 'Empresas',
                to: '/empresas',
                roles: ['admin']
            }
        ]
    },
    {
        label: 'Reportes',
        roles: ['admin', 'pm', 'ops'],
        items: [
            {
                label: 'Reportes Hora',
                to: '/reports',
                roles: ['admin', 'pm']
            },
            {
                label: 'Reportes Costo',
                to: '/reportsCost',
                roles: ['admin', 'pm']
            }
        ]
    },
    {
        label: 'Configuración',
        to: '/settings',
        roles: ['admin']
    }
]

// Función recursiva para filtrar items según roles y convertir a formato PrimeVue
const filterMenuByRoles = (items: MenuItem[]): any[] => {
    const userRole = authStore.profile?.role
    
    if (!userRole) return []
    
    return items
        .filter(item => {
            // Si el item tiene roles definidos, verificar que el usuario tenga acceso
            if (item.roles && !item.roles.includes(userRole)) {
                return false
            }
            return true
        })
        .map(item => {
            // Filtrar subitems recursivamente
            const filteredSubItems = item.items ? filterMenuByRoles(item.items) : undefined
            
            // Si tiene subitems y después de filtrar no quedan, ocultar el padre
            if (item.items && (!filteredSubItems || filteredSubItems.length === 0)) {
                return null
            }
            
            // Crear el objeto para PrimeVue MenuBar
            const menuItem: any = {
                label: item.label,
                icon: item.icon
            }
            
            // Si tiene ruta, agregar propiedad 'to' para router-link
            if (item.to) {
                menuItem.to = item.to
            }
            
            // Si tiene subitems filtrados, agregarlos
            if (filteredSubItems && filteredSubItems.length > 0) {
                menuItem.items = filteredSubItems
            }
            
            return menuItem
        })
        .filter(item => item !== null) // Remover items nulos
}

// Computed property que filtra el menú según los roles del usuario
const filteredItems = computed(() => {
    return filterMenuByRoles(menuItems)
})
</script>

<template>
    <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold">Timesheet MVP</h1>
        <MenuBar :model="filteredItems">
            <template #item="{ item, props, hasSubmenu }">
                <router-link 
                    v-if="item.to" 
                    :to="item.to" 
                    v-bind="props.action"
                    class="flex items-center"
                >
                    <span v-if="item.icon" :class="item.icon" class="mr-2"></span>
                    <span>{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="ml-auto pi pi-angle-down"></span>
                </router-link>
                <a 
                    v-else
                    v-ripple 
                    v-bind="props.action"
                    class="flex items-center"
                >
                    <span v-if="item.icon" :class="item.icon" class="mr-2"></span>
                    <span>{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="ml-auto pi pi-angle-down"></span>
                </a>
            </template>
        </MenuBar>
    </div>
</template>

<style scoped>
/* Reducir tamaño general del menú */
:deep(.p-menubar) {
    padding: 0.25rem 0;
}

/* Reducir espaciado entre items del menú principal */
:deep(.p-menubar-root-list) {
    display: flex;
    gap: 0.25rem;
}

/* Reducir padding y tamaño de fuente de cada item */
:deep(.p-menubar-root-list > .p-menuitem) {
    position: relative;
}

/* Sobrescribir el padding excesivo con mayor especificidad */
:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link) {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

/* Reducir tamaño del texto en los links */
:deep(.p-menubar-root-list .p-menuitem-link span) {
    font-size: 0.875rem;
}

/* Reducir tamaño de los submenús */
:deep(.p-submenu-list) {
    min-width: 180px;
    padding: 0.25rem 0;
}

:deep(.p-submenu-list .p-menuitem-link) {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

/* Reducir tamaño de iconos si los hay */
:deep(.p-menubar-root-list .pi) {
    font-size: 0.75rem;
}

/* Asegurar que los links del menú sean compactos */
:deep(.p-menubar-root-list a) {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.875rem;
    text-decoration: none;
}

/* Reducir espaciado en el contenedor principal */
.flex.items-center {
    gap: 1rem;
}
</style>