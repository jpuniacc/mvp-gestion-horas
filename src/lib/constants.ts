export const DEFAULT_SETTINGS = {
  max_hours_per_day: 8,
  max_hours_per_week: 43,
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  reminder_time: '16:00',
  reminder_day: 'friday',
} as const

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'L', fullLabel: 'Lunes' },
  { key: 'tuesday', label: 'M', fullLabel: 'Martes' },
  { key: 'wednesday', label: 'X', fullLabel: 'Miércoles' },
  { key: 'thursday', label: 'J', fullLabel: 'Jueves' },
  { key: 'friday', label: 'V', fullLabel: 'Viernes' },
  { key: 'saturday', label: 'S', fullLabel: 'Sábado' },
  { key: 'sunday', label: 'D', fullLabel: 'Domingo' },
] as const

export const TIMESHEET_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const TIMESHEET_STATUS_LABELS = {
  [TIMESHEET_STATUS.DRAFT]: 'Borrador',
  [TIMESHEET_STATUS.SUBMITTED]: 'Enviado',
  [TIMESHEET_STATUS.APPROVED]: 'Aprobado',
  [TIMESHEET_STATUS.REJECTED]: 'Rechazado',
} as const

