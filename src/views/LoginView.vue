<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Alert from '@/components/ui/Alert.vue'
import AlertDescription from '@/components/ui/AlertDescription.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  const result = await authStore.signIn(email.value, password.value)
  
  if (result.success) {
    router.push('/timesheet/week')
  } else {
    errorMessage.value = result.error || 'Error al iniciar sesión'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <div class="space-y-2">
            <Label for="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              v-model="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Alert v-if="errorMessage" variant="destructive">
            <AlertDescription>{{ errorMessage }}</AlertDescription>
          </Alert>

          <Button
            type="submit"
            class="w-full"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

