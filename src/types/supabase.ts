export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      becas_estado: {
        Row: {
          codigo_beca: string | null
          created_at: string
          decil_maximo: number | null
          descripcion: string | null
          descuento_monto: number | null
          descuento_porcentaje: number | null
          id: number
          nem_minimo: number | null
          nombre: string | null
          paes_minimo: number | null
          requeire_decil: boolean | null
          requiere_nem: boolean | null
          requiere_paes: boolean | null
          tipo_descuento: string | null
        }
        Insert: {
          codigo_beca?: string | null
          created_at?: string
          decil_maximo?: number | null
          descripcion?: string | null
          descuento_monto?: number | null
          descuento_porcentaje?: number | null
          id?: number
          nem_minimo?: number | null
          nombre?: string | null
          paes_minimo?: number | null
          requeire_decil?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          tipo_descuento?: string | null
        }
        Update: {
          codigo_beca?: string | null
          created_at?: string
          decil_maximo?: number | null
          descripcion?: string | null
          descuento_monto?: number | null
          descuento_porcentaje?: number | null
          id?: number
          nem_minimo?: number | null
          nombre?: string | null
          paes_minimo?: number | null
          requeire_decil?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          tipo_descuento?: string | null
        }
        Relationships: []
      }
      becas_uniacc: {
        Row: {
          activa: boolean | null
          becas_incompatibles: Json | null
          carreras_aplicables: Json | null
          codigo_beca: string
          created_at: string | null
          cupos_disponibles: number | null
          cupos_utilizados: number | null
          descripcion: string | null
          descuento_monto_fijo: number | null
          descuento_porcentaje: number | null
          duracion_meses: number | null
          duracion_tipo: string | null
          es_combinable: boolean | null
          id: string
          max_anos_egreso: number | null
          max_anos_paes: number | null
          modalidades_aplicables: Json
          nacionalidad_requerida: string | null
          nem_minimo: number | null
          nivel_aplicable: string | null
          nombre: string
          paes_minimo: number | null
          prioridad: number | null
          proceso_evaluacion: string | null
          programas_excluidos: Json | null
          ranking_minimo: number | null
          region_excluida: string | null
          region_requerida: string | null
          requiere_beca_estado: boolean | null
          requiere_documentacion: Json | null
          requiere_genero: string | null
          requiere_nacionalidad: boolean | null
          requiere_nem: boolean | null
          requiere_paes: boolean | null
          requiere_ranking: boolean | null
          requiere_region_especifica: boolean | null
          tipo_descuento: string | null
          updated_at: string | null
          vigencia_desde: string
          vigencia_hasta: string | null
        }
        Insert: {
          activa?: boolean | null
          becas_incompatibles?: Json | null
          carreras_aplicables?: Json | null
          codigo_beca: string
          created_at?: string | null
          cupos_disponibles?: number | null
          cupos_utilizados?: number | null
          descripcion?: string | null
          descuento_monto_fijo?: number | null
          descuento_porcentaje?: number | null
          duracion_meses?: number | null
          duracion_tipo?: string | null
          es_combinable?: boolean | null
          id?: string
          max_anos_egreso?: number | null
          max_anos_paes?: number | null
          modalidades_aplicables: Json
          nacionalidad_requerida?: string | null
          nem_minimo?: number | null
          nivel_aplicable?: string | null
          nombre: string
          paes_minimo?: number | null
          prioridad?: number | null
          proceso_evaluacion?: string | null
          programas_excluidos?: Json | null
          ranking_minimo?: number | null
          region_excluida?: string | null
          region_requerida?: string | null
          requiere_beca_estado?: boolean | null
          requiere_documentacion?: Json | null
          requiere_genero?: string | null
          requiere_nacionalidad?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          requiere_ranking?: boolean | null
          requiere_region_especifica?: boolean | null
          tipo_descuento?: string | null
          updated_at?: string | null
          vigencia_desde: string
          vigencia_hasta?: string | null
        }
        Update: {
          activa?: boolean | null
          becas_incompatibles?: Json | null
          carreras_aplicables?: Json | null
          codigo_beca?: string
          created_at?: string | null
          cupos_disponibles?: number | null
          cupos_utilizados?: number | null
          descripcion?: string | null
          descuento_monto_fijo?: number | null
          descuento_porcentaje?: number | null
          duracion_meses?: number | null
          duracion_tipo?: string | null
          es_combinable?: boolean | null
          id?: string
          max_anos_egreso?: number | null
          max_anos_paes?: number | null
          modalidades_aplicables?: Json
          nacionalidad_requerida?: string | null
          nem_minimo?: number | null
          nivel_aplicable?: string | null
          nombre?: string
          paes_minimo?: number | null
          prioridad?: number | null
          proceso_evaluacion?: string | null
          programas_excluidos?: Json | null
          ranking_minimo?: number | null
          region_excluida?: string | null
          region_requerida?: string | null
          requiere_beca_estado?: boolean | null
          requiere_documentacion?: Json | null
          requiere_genero?: string | null
          requiere_nacionalidad?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          requiere_ranking?: boolean | null
          requiere_region_especifica?: boolean | null
          tipo_descuento?: string | null
          updated_at?: string | null
          vigencia_desde?: string
          vigencia_hasta?: string | null
        }
        Relationships: []
      }
      carreras: {
        Row: {
          anio: number | null
          arancel_carrera: number | null
          area_actual: string
          descripcion_escuela: string
          descripcion_facultad: string
          duracion_en_semestres: number | null
          id: number
          matricula_carrera: number | null
          nivel_global: string
          nombre_carrera: string
          nombre_grado: string
          nombre_titulo: string
          tipo_plan_carrera: string
          vigencia: string
        }
        Insert: {
          anio?: number | null
          arancel_carrera?: number | null
          area_actual: string
          descripcion_escuela: string
          descripcion_facultad: string
          duracion_en_semestres?: number | null
          id?: number
          matricula_carrera?: number | null
          nivel_global: string
          nombre_carrera: string
          nombre_grado: string
          nombre_titulo: string
          tipo_plan_carrera: string
          vigencia: string
        }
        Update: {
          anio?: number | null
          arancel_carrera?: number | null
          area_actual?: string
          descripcion_escuela?: string
          descripcion_facultad?: string
          duracion_en_semestres?: number | null
          id?: number
          matricula_carrera?: number | null
          nivel_global?: string
          nombre_carrera?: string
          nombre_grado?: string
          nombre_titulo?: string
          tipo_plan_carrera?: string
          vigencia?: string
        }
        Relationships: []
      }
      carreras_uniacc: {
        Row: {
          anio: number
          arancel: number
          area: string | null
          descripcion_programa: string
          duracion_programa: string
          id: number
          malla: string
          matricula: number
          modalidad_programa: string | null
          nivel_academico: string | null
          nombre_programa: string
          requisitos_ingreso: string
          version_simulador: number | null
        }
        Insert: {
          anio: number
          arancel: number
          area?: string | null
          descripcion_programa: string
          duracion_programa: string
          id?: number
          malla: string
          matricula: number
          modalidad_programa?: string | null
          nivel_academico?: string | null
          nombre_programa: string
          requisitos_ingreso: string
          version_simulador?: number | null
        }
        Update: {
          anio?: number
          arancel?: number
          area?: string | null
          descripcion_programa?: string
          duracion_programa?: string
          id?: number
          malla?: string
          matricula?: number
          modalidad_programa?: string | null
          nivel_academico?: string | null
          nombre_programa?: string
          requisitos_ingreso?: string
          version_simulador?: number | null
        }
        Relationships: []
      }
      colegios: {
        Row: {
          activo: boolean | null
          comuna_id: number
          comuna_nombre: string
          created_at: string | null
          dependencia: string
          direccion: string | null
          email: string | null
          fecha_cierre: string | null
          fecha_creacion: string | null
          id: string
          latitud: number | null
          longitud: number | null
          modalidad: string | null
          nombre: string
          nombre_corto: string | null
          rbd: string
          region_id: number
          region_nombre: string
          sitio_web: string | null
          telefono: string | null
          tipo_educacion: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          comuna_id: number
          comuna_nombre: string
          created_at?: string | null
          dependencia: string
          direccion?: string | null
          email?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          modalidad?: string | null
          nombre: string
          nombre_corto?: string | null
          rbd: string
          region_id: number
          region_nombre: string
          sitio_web?: string | null
          telefono?: string | null
          tipo_educacion: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          comuna_id?: number
          comuna_nombre?: string
          created_at?: string | null
          dependencia?: string
          direccion?: string | null
          email?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          modalidad?: string | null
          nombre?: string
          nombre_corto?: string | null
          rbd?: string
          region_id?: number
          region_nombre?: string
          sitio_web?: string | null
          telefono?: string | null
          tipo_educacion?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      colegios2: {
        Row: {
          comuna_nombre: string | null
          dependencia: string | null
          id: number
          nombre: string | null
          rbd: number | null
          region_id: number | null
          region_nombre: string | null
        }
        Insert: {
          comuna_nombre?: string | null
          dependencia?: string | null
          id?: number
          nombre?: string | null
          rbd?: number | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Update: {
          comuna_nombre?: string | null
          dependencia?: string | null
          id?: number
          nombre?: string | null
          rbd?: number | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Relationships: []
      }
      datos_academicos: {
        Row: {
          año_egreso: number | null
          carrera_deseada: string
          colegio_id: string | null
          comuna_colegio: string | null
          created_at: string | null
          id: string
          nem: number | null
          nivel_educativo_actual: string | null
          nombre_colegio: string | null
          promedio: number | null
          prospecto_id: string
          ranking: number | null
          region_colegio: string | null
          tipo_colegio: string | null
          tipo_programa: string | null
          updated_at: string | null
        }
        Insert: {
          año_egreso?: number | null
          carrera_deseada: string
          colegio_id?: string | null
          comuna_colegio?: string | null
          created_at?: string | null
          id?: string
          nem?: number | null
          nivel_educativo_actual?: string | null
          nombre_colegio?: string | null
          promedio?: number | null
          prospecto_id: string
          ranking?: number | null
          region_colegio?: string | null
          tipo_colegio?: string | null
          tipo_programa?: string | null
          updated_at?: string | null
        }
        Update: {
          año_egreso?: number | null
          carrera_deseada?: string
          colegio_id?: string | null
          comuna_colegio?: string | null
          created_at?: string | null
          id?: string
          nem?: number | null
          nivel_educativo_actual?: string | null
          nombre_colegio?: string | null
          promedio?: number | null
          prospecto_id?: string
          ranking?: number | null
          region_colegio?: string | null
          tipo_colegio?: string | null
          tipo_programa?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "datos_academicos_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "colegios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "datos_academicos_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      datos_socioeconomicos: {
        Row: {
          comuna_residencia: string | null
          created_at: string | null
          decil_ingreso: number | null
          id: string
          ingreso_mensual: number | null
          numero_integrantes_familia: number | null
          planea_usar_cae: boolean | null
          prospecto_id: string
          region_residencia: string | null
          updated_at: string | null
          usa_becas_estado: boolean | null
        }
        Insert: {
          comuna_residencia?: string | null
          created_at?: string | null
          decil_ingreso?: number | null
          id?: string
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          planea_usar_cae?: boolean | null
          prospecto_id: string
          region_residencia?: string | null
          updated_at?: string | null
          usa_becas_estado?: boolean | null
        }
        Update: {
          comuna_residencia?: string | null
          created_at?: string | null
          decil_ingreso?: number | null
          id?: string
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          planea_usar_cae?: boolean | null
          prospecto_id?: string
          region_residencia?: string | null
          updated_at?: string | null
          usa_becas_estado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "datos_socioeconomicos_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      deciles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          decil: number
          descripcion: string
          descripcion_corta: string
          id: string
          orden_visual: number
          porcentaje_poblacion: number
          rango_ingreso_max: number
          rango_ingreso_min: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          decil: number
          descripcion: string
          descripcion_corta: string
          id?: string
          orden_visual: number
          porcentaje_poblacion: number
          rango_ingreso_max: number
          rango_ingreso_min: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          decil?: number
          descripcion?: string
          descripcion_corta?: string
          id?: string
          orden_visual?: number
          porcentaje_poblacion?: number
          rango_ingreso_max?: number
          rango_ingreso_min?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      descuento_modo_pago: {
        Row: {
          activa: boolean | null
          dscto_arancel: number | null
          id: string
          nombre: string | null
        }
        Insert: {
          activa?: boolean | null
          dscto_arancel?: number | null
          id?: string
          nombre?: string | null
        }
        Update: {
          activa?: boolean | null
          dscto_arancel?: number | null
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      descuento_pago_anticipado: {
        Row: {
          activa: boolean | null
          dscto_arancel: number | null
          dscto_matricula: number | null
          fecha_inicio: string | null
          fecha_termino: string | null
          id: string
          nombre: string | null
        }
        Insert: {
          activa?: boolean | null
          dscto_arancel?: number | null
          dscto_matricula?: number | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre?: string | null
        }
        Update: {
          activa?: boolean | null
          dscto_arancel?: number | null
          dscto_matricula?: number | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      mnp_mt_alumno: {
        Row: {
          ano: number | null
          ano_mat: number | null
          anopestud: number | null
          codcarpr: string
          codcli: string
          codpestud: string | null
          codsede: string | null
          estacad: string | null
          jornada: string | null
          periodo: number | null
          periodo_mat: number | null
          periodos: number | null
          rut: string | null
          sync_state: string | null
          tipositu: number | null
        }
        Insert: {
          ano?: number | null
          ano_mat?: number | null
          anopestud?: number | null
          codcarpr: string
          codcli: string
          codpestud?: string | null
          codsede?: string | null
          estacad?: string | null
          jornada?: string | null
          periodo?: number | null
          periodo_mat?: number | null
          periodos?: number | null
          rut?: string | null
          sync_state?: string | null
          tipositu?: number | null
        }
        Update: {
          ano?: number | null
          ano_mat?: number | null
          anopestud?: number | null
          codcarpr?: string
          codcli?: string
          codpestud?: string | null
          codsede?: string | null
          estacad?: string | null
          jornada?: string | null
          periodo?: number | null
          periodo_mat?: number | null
          periodos?: number | null
          rut?: string | null
          sync_state?: string | null
          tipositu?: number | null
        }
        Relationships: []
      }
      mnp_mt_arancel: {
        Row: {
          ano: number | null
          anofin: number | null
          anoini: number | null
          catalumno: number | null
          codcarr: string | null
          fecinivig: string | null
          fectervig: string | null
          jornada: string | null
          matricula: number | null
          monto: number | null
          periodo: number | null
          sync_state: string | null
        }
        Insert: {
          ano?: number | null
          anofin?: number | null
          anoini?: number | null
          catalumno?: number | null
          codcarr?: string | null
          fecinivig?: string | null
          fectervig?: string | null
          jornada?: string | null
          matricula?: number | null
          monto?: number | null
          periodo?: number | null
          sync_state?: string | null
        }
        Update: {
          ano?: number | null
          anofin?: number | null
          anoini?: number | null
          catalumno?: number | null
          codcarr?: string | null
          fecinivig?: string | null
          fectervig?: string | null
          jornada?: string | null
          matricula?: number | null
          monto?: number | null
          periodo?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_beneficio: {
        Row: {
          anos_duracion: number | null
          aplicable: number | null
          aplical: string | null
          codben: number
          descripcion: string | null
          montomax: number | null
          origen_beneficio: string | null
          porcmax: number | null
          prioridad: number | null
          sync_state: string | null
          tipo: string | null
        }
        Insert: {
          anos_duracion?: number | null
          aplicable?: number | null
          aplical?: string | null
          codben: number
          descripcion?: string | null
          montomax?: number | null
          origen_beneficio?: string | null
          porcmax?: number | null
          prioridad?: number | null
          sync_state?: string | null
          tipo?: string | null
        }
        Update: {
          anos_duracion?: number | null
          aplicable?: number | null
          aplical?: string | null
          codben?: number
          descripcion?: string | null
          montomax?: number | null
          origen_beneficio?: string | null
          porcmax?: number | null
          prioridad?: number | null
          sync_state?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      mnp_mt_carrer: {
        Row: {
          codcarr: string
          modalidad: number | null
          nombre_c: string | null
          nombre_l: string | null
          sync_state: string | null
          tipocarr: number | null
          tipomat: number | null
        }
        Insert: {
          codcarr: string
          modalidad?: number | null
          nombre_c?: string | null
          nombre_l?: string | null
          sync_state?: string | null
          tipocarr?: number | null
          tipomat?: number | null
        }
        Update: {
          codcarr?: string
          modalidad?: number | null
          nombre_c?: string | null
          nombre_l?: string | null
          sync_state?: string | null
          tipocarr?: number | null
          tipomat?: number | null
        }
        Relationships: []
      }
      mnp_mt_catalumno: {
        Row: {
          activo: string | null
          codcat: number
          descripcion: string | null
          periodos: number | null
          sync_state: string | null
        }
        Insert: {
          activo?: string | null
          codcat: number
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
        }
        Update: {
          activo?: string | null
          codcat?: number
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_client: {
        Row: {
          categoria: number | null
          celularact: string | null
          ciudadact: string | null
          codapod: string | null
          codaval: string | null
          codcli: string
          codestcivil: string | null
          comuna: string | null
          dig: string | null
          diractual: string | null
          fecnac: string | null
          fonoact: string | null
          mail: string | null
          mail_inst: string | null
          materno: string | null
          nacionalidad: string | null
          nombre: string | null
          paterno: string | null
          sexo: string | null
          sync_state: string | null
        }
        Insert: {
          categoria?: number | null
          celularact?: string | null
          ciudadact?: string | null
          codapod?: string | null
          codaval?: string | null
          codcli: string
          codestcivil?: string | null
          comuna?: string | null
          dig?: string | null
          diractual?: string | null
          fecnac?: string | null
          fonoact?: string | null
          mail?: string | null
          mail_inst?: string | null
          materno?: string | null
          nacionalidad?: string | null
          nombre?: string | null
          paterno?: string | null
          sexo?: string | null
          sync_state?: string | null
        }
        Update: {
          categoria?: number | null
          celularact?: string | null
          ciudadact?: string | null
          codapod?: string | null
          codaval?: string | null
          codcli?: string
          codestcivil?: string | null
          comuna?: string | null
          dig?: string | null
          diractual?: string | null
          fecnac?: string | null
          fonoact?: string | null
          mail?: string | null
          mail_inst?: string | null
          materno?: string | null
          nacionalidad?: string | null
          nombre?: string | null
          paterno?: string | null
          sexo?: string | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_posben: {
        Row: {
          ano: number
          aplicable: number | null
          aprobado: string | null
          codben: number
          codcarr: string | null
          codcli: string
          estado: number | null
          monto: number | null
          monto_apr: number | null
          orden: number | null
          periodo: number
          porc_apr: number | null
          sync_state: string | null
        }
        Insert: {
          ano: number
          aplicable?: number | null
          aprobado?: string | null
          codben: number
          codcarr?: string | null
          codcli: string
          estado?: number | null
          monto?: number | null
          monto_apr?: number | null
          orden?: number | null
          periodo: number
          porc_apr?: number | null
          sync_state?: string | null
        }
        Update: {
          ano?: number
          aplicable?: number | null
          aprobado?: string | null
          codben?: number
          codcarr?: string | null
          codcli?: string
          estado?: number | null
          monto?: number | null
          monto_apr?: number | null
          orden?: number | null
          periodo?: number
          porc_apr?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_tipocarr: {
        Row: {
          descripcion: string | null
          periodos: number | null
          sync_state: string | null
          tipocarr: number
        }
        Insert: {
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
          tipocarr: number
        }
        Update: {
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
          tipocarr?: number
        }
        Relationships: []
      }
      mnp_mt_tipomat: {
        Row: {
          ano_mat: number | null
          descripcion: string | null
          periodo_mat: number | null
          periodos: number | null
          periodosanuales: number | null
          sync_state: string | null
          tipomat: number
        }
        Insert: {
          ano_mat?: number | null
          descripcion?: string | null
          periodo_mat?: number | null
          periodos?: number | null
          periodosanuales?: number | null
          sync_state?: string | null
          tipomat: number
        }
        Update: {
          ano_mat?: number | null
          descripcion?: string | null
          periodo_mat?: number | null
          periodos?: number | null
          periodosanuales?: number | null
          sync_state?: string | null
          tipomat?: number
        }
        Relationships: []
      }
      mnp_ra_modalidad: {
        Row: {
          codigo: number
          descripcion: string | null
          sync_state: string | null
        }
        Insert: {
          codigo: number
          descripcion?: string | null
          sync_state?: string | null
        }
        Update: {
          codigo?: number
          descripcion?: string | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_ra_pestud: {
        Row: {
          codcarr: string | null
          codpestud: string
          duracion: number | null
          nompestud: string | null
        }
        Insert: {
          codcarr?: string | null
          codpestud: string
          duracion?: number | null
          nompestud?: string | null
        }
        Update: {
          codcarr?: string | null
          codpestud?: string
          duracion?: number | null
          nompestud?: string | null
        }
        Relationships: []
      }
      nacionalidades: {
        Row: {
          activa: boolean | null
          codigo_iso: string
          continente: string
          created_at: string | null
          id: string
          nombre_espanol: string
          nombre_ingles: string
          orden_visual: number | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          codigo_iso: string
          continente: string
          created_at?: string | null
          id?: string
          nombre_espanol: string
          nombre_ingles: string
          orden_visual?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          codigo_iso?: string
          continente?: string
          created_at?: string | null
          id?: string
          nombre_espanol?: string
          nombre_ingles?: string
          orden_visual?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prospectos: {
        Row: {
          año_egreso: number | null
          apellido: string
          area_interes: string | null
          becas_estado: boolean | null
          cae: boolean | null
          carrera: number | null
          carreratitulo: string | null
          colegio: string | null
          comprension_lectora: number | null
          comuna: string | null
          created_at: string | null
          curso: string
          decil: string | null
          email: string
          genero: string | null
          id: string
          matematica1: number | null
          modalidadpreferencia: Json | null
          nem: number | null
          nombre: string
          objetivo: Json | null
          paes: boolean | null
          pais: string | null
          pasaporte: string | null
          rango_ingreso: string | null
          ranking: number | null
          region: string | null
          region_pais: string | null
          rut: string | null
          segmentacion: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          año_egreso?: number | null
          apellido: string
          area_interes?: string | null
          becas_estado?: boolean | null
          cae?: boolean | null
          carrera?: number | null
          carreratitulo?: string | null
          colegio?: string | null
          comprension_lectora?: number | null
          comuna?: string | null
          created_at?: string | null
          curso: string
          decil?: string | null
          email: string
          genero?: string | null
          id?: string
          matematica1?: number | null
          modalidadpreferencia?: Json | null
          nem?: number | null
          nombre: string
          objetivo?: Json | null
          paes?: boolean | null
          pais?: string | null
          pasaporte?: string | null
          rango_ingreso?: string | null
          ranking?: number | null
          region?: string | null
          region_pais?: string | null
          rut?: string | null
          segmentacion?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          año_egreso?: number | null
          apellido?: string
          area_interes?: string | null
          becas_estado?: boolean | null
          cae?: boolean | null
          carrera?: number | null
          carreratitulo?: string | null
          colegio?: string | null
          comprension_lectora?: number | null
          comuna?: string | null
          created_at?: string | null
          curso?: string
          decil?: string | null
          email?: string
          genero?: string | null
          id?: string
          matematica1?: number | null
          modalidadpreferencia?: Json | null
          nem?: number | null
          nombre?: string
          objetivo?: Json | null
          paes?: boolean | null
          pais?: string | null
          pasaporte?: string | null
          rango_ingreso?: string | null
          ranking?: number | null
          region?: string | null
          region_pais?: string | null
          rut?: string | null
          segmentacion?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_carrera_fkey"
            columns: ["carrera"]
            isOneToOne: false
            referencedRelation: "carreras_uniacc"
            referencedColumns: ["id"]
          },
        ]
      }
      puntajes_paes: {
        Row: {
          año_rendicion: number | null
          created_at: string | null
          estado_estudiante: string | null
          fecha_rendicion: string | null
          id: string
          prospecto_id: string
          puntaje_biologia: number | null
          puntaje_ciencias: number | null
          puntaje_comprension_lectora: number | null
          puntaje_fisica: number | null
          puntaje_historia_geografia: number | null
          puntaje_matematica_1: number | null
          puntaje_matematica_2: number | null
          puntaje_quimica: number | null
          puntaje_total: number | null
          rendio_paes: boolean | null
          tipo_rendicion: string | null
          updated_at: string | null
        }
        Insert: {
          año_rendicion?: number | null
          created_at?: string | null
          estado_estudiante?: string | null
          fecha_rendicion?: string | null
          id?: string
          prospecto_id: string
          puntaje_biologia?: number | null
          puntaje_ciencias?: number | null
          puntaje_comprension_lectora?: number | null
          puntaje_fisica?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_quimica?: number | null
          puntaje_total?: number | null
          rendio_paes?: boolean | null
          tipo_rendicion?: string | null
          updated_at?: string | null
        }
        Update: {
          año_rendicion?: number | null
          created_at?: string | null
          estado_estudiante?: string | null
          fecha_rendicion?: string | null
          id?: string
          prospecto_id?: string
          puntaje_biologia?: number | null
          puntaje_ciencias?: number | null
          puntaje_comprension_lectora?: number | null
          puntaje_fisica?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_quimica?: number | null
          puntaje_total?: number | null
          rendio_paes?: boolean | null
          tipo_rendicion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puntajes_paes_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      simulaciones: {
        Row: {
          beneficios_aplicables: Json | null
          created_at: string | null
          datos_entrada: Json
          fecha_simulacion: string | null
          id: string
          prospecto_id: string
          resultados: Json | null
          updated_at: string | null
        }
        Insert: {
          beneficios_aplicables?: Json | null
          created_at?: string | null
          datos_entrada: Json
          fecha_simulacion?: string | null
          id?: string
          prospecto_id: string
          resultados?: Json | null
          updated_at?: string | null
        }
        Update: {
          beneficios_aplicables?: Json | null
          created_at?: string | null
          datos_entrada?: Json
          fecha_simulacion?: string | null
          id?: string
          prospecto_id?: string
          resultados?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulaciones_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      validacion_alumno_nuevo: {
        Row: {
          es_alumno_nuevo: boolean
          fecha_validacion: string | null
          id: string
          observaciones: string | null
          prospecto_id: string | null
        }
        Insert: {
          es_alumno_nuevo?: boolean
          fecha_validacion?: string | null
          id?: string
          observaciones?: string | null
          prospecto_id?: string | null
        }
        Update: {
          es_alumno_nuevo?: boolean
          fecha_validacion?: string | null
          id?: string
          observaciones?: string | null
          prospecto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validacion_alumno_nuevo_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_comunas_por_region: {
        Args: { region: number }
        Returns: {
          comuna_nombre: string
        }[]
      }
      get_regiones_unicas: {
        Args: never
        Returns: {
          region_id: string
          region_nombre: string
        }[]
      }
      obtener_beneficios_por_nivel: {
        Args: { prospecto_uuid: string }
        Returns: {
          codigo_beneficio: number
          descripcion: string
          elegible: boolean
          monto_maximo: number
          porcentaje_maximo: number
          razon_elegibilidad: string
          tipo_beneficio: string
        }[]
      }
      obtiene_apertura_periodo: {
        Args: { p_tipomat: number }
        Returns: {
          ano_apertura: number
          periodo_apertura: number
          periodos_apertura: number
        }[]
      }
      obtiene_arancel_carrera: {
        Args: { p_codcarr: string; p_rut: string }
        Returns: {
          arancel_base: number
          matricula_base: number
          message: string
          status: number
        }[]
      }
      obtiene_carreras: {
        Args: { p_rut: string }
        Returns: {
          codcarr: string
          nombre: string
        }[]
      }
      obtiene_datos_matricula: {
        Args: { p_codcarr: string; p_rut: string }
        Returns: {
          ano_actual: number
          ano_ingreso: number
          periodo_actual: number
          periodo_ingreso: number
          periodos_actual: number
          tipomat: number
        }[]
      }
      puede_simular: { Args: { prospecto_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
