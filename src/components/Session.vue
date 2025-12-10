<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import { computed, onMounted } from 'vue'

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
</template>

<style scoped></style>