<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  if (!authStore.profile?.full_name) return 'U'
  const names = authStore.profile.full_name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return names[0][0].toUpperCase()
})

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
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold">Timesheet MVP</h1>
          <nav class="flex gap-4 ml-8">
            <router-link
              to="/timesheet/week"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              active-class="text-foreground"
            >
              Mi Timesheet
            </router-link>
            <router-link
              v-if="authStore.isAdmin || authStore.isPM"
              to="/approvals"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              active-class="text-foreground"
            >
              Aprobaciones
            </router-link>
            <router-link
              v-if="authStore.isAdmin || authStore.isPM"
              to="/projects"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              active-class="text-foreground"
            >
              Proyectos
            </router-link>
            <router-link
              v-if="authStore.isAdmin || authStore.isPM || authStore.isOps"
              to="/reports"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              active-class="text-foreground"
            >
              Reportes
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/settings"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              active-class="text-foreground"
            >
              Configuración
            </router-link>
          </nav>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{{ userInitials }}</AvatarFallback>
            </Avatar>
            <div class="text-sm">
              <div class="font-medium">{{ authStore.profile?.full_name }}</div>
              <div class="text-muted-foreground text-xs">{{ authStore.profile?.role }}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="handleSignOut">
            Salir
          </Button>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

