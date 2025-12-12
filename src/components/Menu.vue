<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuBar from 'primevue/menubar';

const authStore = useAuthStore()
const route = useRoute()

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
        icon: 'pi pi-calendar',
        roles: ['admin', 'pm', 'ops', 'user']
    },
    {
        label: 'Aprobaciones',
        to: '/approvals',
        icon: 'pi pi-check-circle',
        roles: ['admin', 'pm']
    },
    {
        label: 'Mantenedores',
        icon: 'pi pi-cog',
        roles: ['admin'],
        items: [
            {
                label: 'Proyectos',
                to: '/projects',
                icon: 'pi pi-folder',
                roles: ['admin']
            },
            {
                label: 'Usuarios',
                to: '/users',
                icon: 'pi pi-users',
                roles: ['admin']
            },
            {
                label: 'Empresas',
                to: '/empresas',
                icon: 'pi pi-building',
                roles: ['admin']
            }
        ]
    },
    {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        roles: ['admin', 'pm', 'ops'],
        items: [
            {
                label: 'Reportes Hora',
                to: '/reports',
                icon: 'pi pi-clock',
                roles: ['admin', 'pm']
            },
            {
                label: 'Reportes Costo',
                to: '/reportsCost',
                icon: 'pi pi-dollar',
                roles: ['admin', 'pm']
            }
        ]
    },
    {
        label: 'Configuración',
        to: '/settings',
        icon: 'pi pi-sliders-h',
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
                icon: item.icon,
                class: 'menu-item'
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

// Función para verificar si una ruta está activa
const isActiveRoute = (to: string): boolean => {
    if (!to) return false
    // Comparar rutas exactas o si la ruta actual comienza con la ruta del menú
    return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
    <div class="menu-container">
        <div class="menu-brand">
            <h1 class="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Timesheet MVP
            </h1>
        </div>
        <MenuBar :model="filteredItems" class="custom-menubar">
            <template #item="{ item, props, hasSubmenu }">
                <router-link 
                    v-if="item.to" 
                    :to="item.to" 
                    v-bind="props.action"
                    :class="['menu-link', { 'menu-link-active': isActiveRoute(item.to) }]"
                >
                    <span v-if="item.icon" :class="item.icon" class="menu-icon"></span>
                    <span class="menu-label">{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="menu-arrow pi pi-angle-down"></span>
                </router-link>
                <a 
                    v-else
                    v-ripple 
                    v-bind="props.action"
                    class="menu-link"
                >
                    <span v-if="item.icon" :class="item.icon" class="menu-icon"></span>
                    <span class="menu-label">{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="menu-arrow pi pi-angle-down"></span>
                </a>
            </template>
        </MenuBar>
    </div>
</template>

<style scoped>
.menu-container {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 0.75rem 1rem;
    background: hsl(var(--card));
    border-bottom: 1px solid hsl(var(--border));
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.menu-brand h1 {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    white-space: nowrap;
}

/* Estilos del MenuBar */
:deep(.custom-menubar.p-menubar) {
    background: transparent;
    border: none;
    padding: 0;
}

/* Lista principal del menú */
:deep(.p-menubar-root-list) {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

/* Items del menú principal */
:deep(.p-menubar-root-list > .p-menuitem) {
    position: relative;
    margin: 0;
}

/* Links del menú principal */
:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease-in-out;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link:hover),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover) {
    background: hsl(var(--muted));
    color: hsl(var(--primary));
}

/* Estado activo del router-link */
:deep(.menu-link-active) {
    background: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
    font-weight: 600;
}

:deep(.menu-link-active::after) {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 2px;
    background: hsl(var(--primary));
    border-radius: 2px 2px 0 0;
}

/* Iconos del menú */
.menu-icon {
    font-size: 0.875rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.menu-label {
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.menu-arrow {
    font-size: 0.75rem;
    margin-left: 0.25rem;
    transition: transform 0.2s ease-in-out;
}

:deep(.p-menubar-root-list > .p-menuitem.p-menuitem-active > .p-menuitem-link .menu-arrow) {
    transform: rotate(180deg);
}

/* Submenús */
:deep(.p-submenu-list) {
    min-width: 200px;
    padding: 0.5rem;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    margin-top: 0.5rem;
}

:deep(.p-submenu-list .p-menuitem-link) {
    padding: 0.625rem 0.875rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

:deep(.p-submenu-list .p-menuitem-link:hover) {
    background: hsl(var(--muted));
    color: hsl(var(--primary));
}

:deep(.p-submenu-list .p-menuitem-link .pi) {
    font-size: 0.75rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Clase personalizada para los links del menú */
.menu-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
}

/* Responsive */
@media (max-width: 768px) {
    .menu-container {
        gap: 1rem;
        padding: 0.5rem 0.75rem;
    }
    
    .menu-brand h1 {
        font-size: 1rem;
    }
    
    :deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link),
    :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
    }
    
    .menu-label {
        display: none;
    }
    
    .menu-icon {
        font-size: 1rem;
    }
}
</style>