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
      empresas: {
        Row: {
          created_at: string | null
          estado_empresa: string | null
          id: number
          logo_empresa: string | null
          nombre_fantasia: string
          razon_social: string
          rut: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado_empresa?: string | null
          id?: number
          logo_empresa?: string | null
          nombre_fantasia: string
          razon_social: string
          rut: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado_empresa?: string | null
          id?: number
          logo_empresa?: string | null
          nombre_fantasia?: string
          razon_social?: string
          rut?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          rut_empresa: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          rut_empresa: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          rut_empresa?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          empresa_rut: string | null
          full_name: string
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_rut?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_rut?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_rut_fkey"
            columns: ["empresa_rut"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["rut"]
          },
        ]
      }
      project_assignments: {
        Row: {
          billing_rate: number | null
          cost_rate: number | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_billable: boolean | null
          project_id: string | null
          role_name: string | null
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_rate?: number | null
          cost_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_billable?: boolean | null
          project_id?: string | null
          role_name?: string | null
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_rate?: number | null
          cost_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_billable?: boolean | null
          project_id?: string | null
          role_name?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          empresa_rut: string | null
          id: string
          is_billable_default: boolean | null
          name: string
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          client_name?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          empresa_rut?: string | null
          id?: string
          is_billable_default?: boolean | null
          name: string
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          client_name?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          empresa_rut?: string | null
          id?: string
          is_billable_default?: boolean | null
          name?: string
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_empresa_rut_fkey"
            columns: ["empresa_rut"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["rut"]
          },
        ]
      }
      tasks: {
        Row: {
          code: string
          created_at: string | null
          empresa_rut: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          empresa_rut?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          empresa_rut?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_empresa_rut_fkey"
            columns: ["empresa_rut"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          hours_friday: number | null
          hours_monday: number | null
          hours_saturday: number | null
          hours_sunday: number | null
          hours_thursday: number | null
          hours_tuesday: number | null
          hours_wednesday: number | null
          id: string
          is_billable: boolean | null
          notes: string | null
          project_id: string | null
          task_id: string | null
          timesheet_week_id: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          hours_friday?: number | null
          hours_monday?: number | null
          hours_saturday?: number | null
          hours_sunday?: number | null
          hours_thursday?: number | null
          hours_tuesday?: number | null
          hours_wednesday?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          project_id?: string | null
          task_id?: string | null
          timesheet_week_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          hours_friday?: number | null
          hours_monday?: number | null
          hours_saturday?: number | null
          hours_sunday?: number | null
          hours_thursday?: number | null
          hours_tuesday?: number | null
          hours_wednesday?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          project_id?: string | null
          task_id?: string | null
          timesheet_week_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "project_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_timesheet_week_id_fkey"
            columns: ["timesheet_week_id"]
            isOneToOne: false
            referencedRelation: "timesheet_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_weeks: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_locked: boolean | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          total_hours: number | null
          updated_at: string | null
          user_id: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
          week_end_date?: string
          week_number?: number
          week_start_date?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
