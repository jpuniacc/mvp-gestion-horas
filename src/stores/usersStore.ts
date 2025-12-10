import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

type ProjectUser = {
  id: string
  project_id: string
  user_id: string
  role?: string | null
  billing_rate?: number | null
  user?: {
    id: string
    email: string
    raw_user_meta_data?: Record<string, any> | null
  }
  [key: string]: any
}

export const useUsersStore = defineStore('users', () => {
  const projectUsers = ref<ProjectUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadProjectUsers(projectId: string) {
    if (!projectId) {
      projectUsers.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase.rpc as any)(
        'get_project_assignments_with_user',
        { project_id: projectId }
      )

      if (queryError) {
        throw queryError
      }

      projectUsers.value = (data as ProjectUser[]) || []
    } catch (err: any) {
      console.error('Error loading project users:', err)
      error.value = err.message ?? 'Error al cargar usuarios del proyecto'
    } finally {
      loading.value = false
    }
  }

  function clearProjectUsers() {
    projectUsers.value = []
  }

  async function createUser(email: string, fullName: string, empresaRut: string, role: string) {
    console.log('createUser', email, fullName, empresaRut, role);

    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: '123456',
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined, // No enviar email de confirmación por ahora
        },
      })

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        throw signUpError
      }

      // Si se creó el usuario exitosamente, crear el perfil
      if (data.user?.id && empresaRut) {
        try {
          await createProfile(data.user.id, empresaRut, fullName, role)
        } catch (profileError: any) {
          console.error('Error creating profile:', profileError)
          // No lanzamos el error aquí para no fallar la creación del usuario
          // pero lo registramos
        }
      }

      return {
        success: true,
        user: data.user,
      }
    } catch (err: any) {
      console.error('Error creating user:', err)
      error.value = err.message ?? 'Error al crear usuario'
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  async function createProfile(userId: string, empresaRut: string, fullName: string, role: string) {
    if (!userId || !empresaRut || !fullName || !role) {
      throw new Error('user_id, empresa_rut, full_name y role son requeridos')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          empresa_rut: empresaRut,
          full_name: fullName,
          role: role,
          is_active: false,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return data as Profile
    } catch (err: any) {
      console.error('Error creating profile:', err)
      error.value = err.message ?? 'Error al crear perfil'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projectUsers,
    loading,
    error,
    loadProjectUsers,
    clearProjectUsers,
    createUser,
    createProfile,
  }
})

