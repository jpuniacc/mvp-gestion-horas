<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import { computed, onMounted, ref } from 'vue'
import Menu from 'primevue/menu'

const router = useRouter()
const authStore = useAuthStore()
const menu = ref()

const userInitials = computed(() => {
    if (!authStore.profile?.full_name) return 'U'
    const names = authStore.profile.full_name.split(' ')
    if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
})

const roleLabel = computed(() => {
    const roleMap: Record<string, string> = {
        admin: 'Administrador',
        pm: 'Jefe de Proyecto',
        ops: 'Operaciones',
        user: 'Usuario'
    }
    return roleMap[authStore.profile?.role || 'user'] || authStore.profile?.role || 'Usuario'
})

const menuItems = computed(() => [
    {
        label: authStore.profile?.full_name || 'Usuario',
        icon: 'pi pi-user',
        disabled: true,
        class: 'menu-header'
    },
    {
        separator: true
    },
    {
        label: roleLabel.value,
        icon: 'pi pi-id-card',
        disabled: true,
        class: 'menu-role'
    },
    {
        separator: true
    },
    {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: handleSignOut
    }
])

const toggleMenu = (event: Event) => {
    menu.value.toggle(event)
}

const handleSignOut = async () => {
    await authStore.signOut()
    router.push('/login')
}

onMounted(() => {
    if (!authStore.user) {
        authStore.initialize()
    }
})
</script>

<template>
    <div class="session-container">
        <div class="session-user" @click="toggleMenu" v-ripple>
            <Avatar class="session-avatar">
                <AvatarFallback class="session-avatar-fallback">{{ userInitials }}</AvatarFallback>
            </Avatar>
            <div class="session-info">
                <div class="session-name">{{ authStore.profile?.full_name || 'Usuario' }}</div>
                <div class="session-role">{{ roleLabel }}</div>
            </div>
            <i class="pi pi-chevron-down session-chevron"></i>
        </div>
        
        <Menu ref="menu" :model="menuItems" :popup="true" class="session-menu">
            <template #item="{ item }">
                <div v-if="item.separator" class="session-menu-separator"></div>
                <a v-else class="session-menu-item" :class="item.class" @click="item.command">
                    <i :class="item.icon" class="session-menu-icon"></i>
                    <span>{{ item.label }}</span>
                </a>
            </template>
        </Menu>
    </div>
</template>

<style scoped>
.session-container {
    position: relative;
}

.session-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    user-select: none;
    border: 1px solid transparent;
}

.session-user:hover {
    background: hsl(var(--muted));
    border-color: hsl(var(--border));
}

.session-avatar {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
}

.session-avatar-fallback {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7));
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.session-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
}

.session-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    line-height: 1.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.session-role {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
    line-height: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.session-chevron {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
    transition: transform 0.2s ease-in-out;
    margin-left: 0.25rem;
}

.session-user:hover .session-chevron {
    color: hsl(var(--foreground));
}

/* Estilos del menú desplegable */
:deep(.session-menu.p-menu) {
    min-width: 220px;
    padding: 0.5rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    background: hsl(var(--card));
    margin-top: 0.5rem;
}

.session-menu-separator {
    height: 1px;
    background: hsl(var(--border));
    margin: 0.5rem 0;
}

.session-menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
}

.session-menu-item:hover {
    background: hsl(var(--muted));
    color: hsl(var(--primary));
}

.session-menu-item.menu-header {
    font-weight: 600;
    color: hsl(var(--foreground));
    cursor: default;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}

.session-menu-item.menu-header:hover {
    background: transparent;
    color: hsl(var(--foreground));
}

.session-menu-item.menu-role {
    font-size: 0.8125rem;
    color: hsl(var(--muted-foreground));
    cursor: default;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}

.session-menu-item.menu-role:hover {
    background: transparent;
    color: hsl(var(--muted-foreground));
}

.session-menu-icon {
    font-size: 0.875rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.session-menu-item:not(.menu-header):not(.menu-role) .session-menu-icon {
    color: hsl(var(--muted-foreground));
}

.session-menu-item:not(.menu-header):not(.menu-role):hover .session-menu-icon {
    color: hsl(var(--primary));
}

/* Responsive */
@media (max-width: 768px) {
    .session-info {
        display: none;
    }
    
    .session-chevron {
        display: none;
    }
    
    .session-user {
        padding: 0.375rem;
    }
    
    .session-avatar {
        width: 2rem;
        height: 2rem;
    }
}
</style>