// Re-export types from Supabase
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './supabase'
import type { Database } from './supabase'

// Helper: Simplify table type access for public schema
type PublicTableName = keyof Database['public']['Tables']

// Type aliases for easier use (auto-detects public schema)
export type TableRow<T extends PublicTableName> = Tables<T>
export type TableInsert<T extends PublicTableName> = TablesInsert<T>
export type TableUpdate<T extends PublicTableName> = TablesUpdate<T>

// Type aliases for easier use
export type Empresa = TableRow<'empresas'>
export type Profile = TableRow<'profiles'>
export type Project = TableRow<'projects'>
export type ProjectAssignment = TableRow<'project_assignments'>
export type Task = TableRow<'tasks'>
export type TimesheetWeek = TableRow<'timesheet_weeks'>
export type TimesheetEntry = TableRow<'timesheet_entries'>
export type OrgSetting = TableRow<'org_settings'>

// Helper types for inserts
export type EmpresaInsert = TableInsert<'empresas'>
export type ProfileInsert = TableInsert<'profiles'>
export type ProjectInsert = TableInsert<'projects'>
export type ProjectAssignmentInsert = TableInsert<'project_assignments'>
export type TaskInsert = TableInsert<'tasks'>
export type TimesheetWeekInsert = TableInsert<'timesheet_weeks'>
export type TimesheetEntryInsert = TableInsert<'timesheet_entries'>
export type OrgSettingInsert = TableInsert<'org_settings'>

// Helper types for updates
export type EmpresaUpdate = TableUpdate<'empresas'>
export type ProfileUpdate = TableUpdate<'profiles'>
export type ProjectUpdate = TableUpdate<'projects'>
export type ProjectAssignmentUpdate = TableUpdate<'project_assignments'>
export type TaskUpdate = TableUpdate<'tasks'>
export type TimesheetWeekUpdate = TableUpdate<'timesheet_weeks'>
export type TimesheetEntryUpdate = TableUpdate<'timesheet_entries'>
export type OrgSettingUpdate = TableUpdate<'org_settings'>

