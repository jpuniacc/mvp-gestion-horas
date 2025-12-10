import { supabase } from "@/lib/supabase";
import { Empresa, Profile } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useEmpresasStore = defineStore('empresas', () => {
    const empresas = ref<Empresa[]>([]);
    const profiles = ref<Profile[]>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);

    async function loadEmpresas() {
        try {
            loading.value = true;
            error.value = null;

            const {data, error: queryError} = await supabase.from('empresas').select('*');
            if (queryError) throw queryError;
            empresas.value = data as Empresa[] || [];
        }catch(err: any) {
            console.error('Error loading empresas:', err);
            error.value = err.message || 'Error al cargar empresas';
        }finally{
            loading.value = false;
        }
    }

    async function getUsersEmpresa(empresaRut: string) {
        if (!empresaRut) {
            profiles.value = [];
            return;
        }

        try {
            loading.value = true;
            error.value = null;
            const {data, error: queryError} = await supabase.from('profiles').select('*').eq('empresa_rut', empresaRut);
            if (queryError) throw queryError;
            profiles.value = data as Profile[] || [];
        }catch(err: any) {
            console.error('Error loading users:', err);
            error.value = err.message || 'Error al cargar usuarios';
        }finally{
            loading.value = false;
        }
    }

    async function updateProfile(params: {
        id: string
        full_name: string
        role: string
        is_active: boolean
    }) {
        const { id, full_name, role, is_active } = params;

        if (!id || !full_name || !role) {
            throw new Error('Faltan campos requeridos para actualizar el perfil');
        }

        try {
            loading.value = true;
            error.value = null;

            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name,
                    role,
                    is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw updateError;
            }

            // Actualizar el perfil en el array local
            const index = profiles.value.findIndex((p: Profile) => p.id === id);
            if (index !== -1 && data) {
                profiles.value[index] = data as Profile;
            }

            return data as Profile;
        } catch (err: any) {
            console.error('Error updating profile:', err);
            error.value = err.message || 'Error al actualizar el perfil';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        empresas,
        profiles,
        loading,
        error,

        loadEmpresas,
        getUsersEmpresa,
        updateProfile,
    }

});

