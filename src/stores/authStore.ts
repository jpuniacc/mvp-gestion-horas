import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isPM = computed(() => profile.value?.role === 'pm')
  const isUser = computed(() => profile.value?.role === 'user')
  const isOps = computed(() => profile.value?.role === 'ops')
  const isAuthenticated = computed(() => !!user.value)

  async function signIn(email: string, password: string) {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      await supabase.auth.signUp()

      if (authError) throw authError

      user.value = data.user
      if (data.user) {
        await loadProfile(data.user.id)
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      user.value = null
      profile.value = null

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Error al cerrar sesión'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      profile.value = data
    } catch (err: any) {
      console.error('Error loading profile:', err)
      error.value = err.message || 'Error al cargar perfil'
    }
  }

  async function initialize() {
    try {
      loading.value = true

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        user.value = session.user
        await loadProfile(session.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          user.value = session.user
          await loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
        }
      })
    } catch (err: any) {
      console.error('Error initializing auth:', err)
      error.value = err.message || 'Error al inicializar autenticación'
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    isPM,
    isUser,
    isOps,
    isAuthenticated,
    signIn,
    signOut,
    loadProfile,
    initialize,
  }
})

