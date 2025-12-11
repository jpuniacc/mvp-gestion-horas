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

    async function createEmpresa(params: {
        rut: string
        razon_social: string
        nombre_fantasia: string
        logo_empresa?: string | null
        estado_empresa?: 'activo' | 'inactivo'
    }) {
        const { rut, razon_social, nombre_fantasia, logo_empresa, estado_empresa } = params

        if (!rut || !razon_social || !nombre_fantasia) {
            throw new Error('RUT, razón social y nombre fantasía son requeridos')
        }

        try {
            loading.value = true
            error.value = null

            const { data, error: insertError } = await supabase
                .from('empresas')
                .insert({
                    rut,
                    razon_social,
                    nombre_fantasia,
                    logo_empresa: logo_empresa || null,
                    estado_empresa: estado_empresa || 'activo',
                })
                .select()
                .single()

            if (insertError) {
                throw insertError
            }

            // Agregar a la lista local
            if (data) {
                empresas.value.push(data as Empresa)
            }

            return data as Empresa
        } catch (err: any) {
            console.error('Error creating empresa:', err)
            error.value = err.message || 'Error al crear empresa'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateEmpresa(id: number, params: {
        rut?: string
        razon_social?: string
        nombre_fantasia?: string
        logo_empresa?: string | null
        estado_empresa?: 'activo' | 'inactivo'
    }) {
        if (!id) {
            throw new Error('ID de empresa es requerido')
        }

        try {
            loading.value = true
            error.value = null

            const updateData: any = {
                updated_at: new Date().toISOString(),
            }

            if (params.rut !== undefined) updateData.rut = params.rut
            if (params.razon_social !== undefined) updateData.razon_social = params.razon_social
            if (params.nombre_fantasia !== undefined) updateData.nombre_fantasia = params.nombre_fantasia
            if (params.logo_empresa !== undefined) updateData.logo_empresa = params.logo_empresa
            if (params.estado_empresa !== undefined) updateData.estado_empresa = params.estado_empresa

            const { data, error: updateError } = await supabase
                .from('empresas')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (updateError) {
                throw updateError
            }

            // Actualizar en la lista local
            const index = empresas.value.findIndex((e: Empresa) => e.id === id)
            if (index !== -1 && data) {
                empresas.value[index] = data as Empresa
            }

            return data as Empresa
        } catch (err: any) {
            console.error('Error updating empresa:', err)
            error.value = err.message || 'Error al actualizar empresa'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteEmpresa(id: number) {
        if (!id) {
            throw new Error('ID de empresa es requerido')
        }

        try {
            loading.value = true
            error.value = null

            const { error: deleteError } = await supabase
                .from('empresas')
                .delete()
                .eq('id', id)

            if (deleteError) {
                throw deleteError
            }

            // Eliminar de la lista local
            empresas.value = empresas.value.filter((e: Empresa) => e.id !== id)

            return true
        } catch (err: any) {
            console.error('Error deleting empresa:', err)
            error.value = err.message || 'Error al eliminar empresa'
            throw err
        } finally {
            loading.value = false
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
        createEmpresa,
        updateEmpresa,
        deleteEmpresa,
    }

});

