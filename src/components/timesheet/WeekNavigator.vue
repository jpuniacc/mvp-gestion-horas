<script setup lang="ts">
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import type { UseWeekNavigationReturn } from '@/composables/useWeekNavigation'
import { computed } from 'vue'
import { getWeek } from 'date-fns'

interface Props {
  syncWithRouter?: boolean
  navigation?: UseWeekNavigationReturn
}

const props = withDefaults(defineProps<Props>(), {
  syncWithRouter: true,
  navigation: undefined,
})

const navigation =
  props.navigation ?? useWeekNavigation({ syncWithRouter: props.syncWithRouter })

const {
  currentYear,
  currentWeek,
  weekRangeLabel,
  nextWeek,
  previousWeek,
  goToCurrentWeek,
} = navigation

const isCurrentWeek = computed(() => {
  const now = new Date()
  const currentYearNow = now.getFullYear()
  const currentWeekNow = getWeek(now, { weekStartsOn: 1 })
  return currentYear.value === currentYearNow && currentWeek.value === currentWeekNow
})
</script>

<template>
  <div class="week-navigator">
    <div class="week-navigator-controls">
      <button 
        class="nav-button nav-button-prev" 
        @click="previousWeek"
        title="Semana anterior"
      >
        <i class="pi pi-chevron-left"></i>
        <span class="nav-button-label">Anterior</span>
      </button>
      
      <button 
        class="nav-button nav-button-current" 
        @click="goToCurrentWeek"
        :class="{ 'nav-button-active': isCurrentWeek }"
        title="Ir a la semana actual"
      >
        <i class="pi pi-calendar"></i>
        <span class="nav-button-label">Hoy</span>
      </button>
      
      <button 
        class="nav-button nav-button-next" 
        @click="nextWeek"
        title="Semana siguiente"
      >
        <span class="nav-button-label">Siguiente</span>
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
    
    <div class="week-navigator-info">
      <div class="week-info-badge">
        <i class="pi pi-calendar-week week-info-icon"></i>
        <div class="week-info-content">
          <div class="week-info-label">Semana {{ currentWeek }} de {{ currentYear }}</div>
          <div class="week-info-range">{{ weekRangeLabel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-navigator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.week-navigator-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

.nav-button:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary) / 0.5);
  color: hsl(var(--primary));
}

.nav-button:active {
  transform: scale(0.98);
}

.nav-button i {
  font-size: 0.875rem;
}

.nav-button-label {
  font-size: 0.875rem;
}

.nav-button-current {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.3);
  color: hsl(var(--primary));
  font-weight: 600;
}

.nav-button-current:hover {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary) / 0.5);
}

.nav-button-active {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.nav-button-active:hover {
  background: hsl(var(--primary) / 0.9);
}

.week-navigator-info {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.week-info-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
}

.week-info-icon {
  font-size: 1.25rem;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.week-info-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.week-info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.week-info-range {
  font-size: 0.9375rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  line-height: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .week-navigator {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .week-navigator-controls {
    width: 100%;
    justify-content: center;
  }
  
  .nav-button {
    flex: 1;
    justify-content: center;
    padding: 0.5rem 0.75rem;
  }
  
  .nav-button-label {
    display: none;
  }
  
  .nav-button i {
    font-size: 1rem;
  }
  
  .week-navigator-info {
    width: 100%;
  }
  
  .week-info-badge {
    width: 100%;
    justify-content: center;
    padding: 0.625rem 1rem;
  }
  
  .week-info-content {
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .week-info-icon {
    display: none;
  }
  
  .week-info-badge {
    padding: 0.5rem 0.75rem;
  }
}
</style>

