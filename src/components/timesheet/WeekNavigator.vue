<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import type { UseWeekNavigationReturn } from '@/composables/useWeekNavigation'

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
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-4">
      <Button variant="outline" size="sm" @click="previousWeek">
        ← Anterior
      </Button>
      <Button variant="outline" size="sm" @click="nextWeek">
        Siguiente →
      </Button>
      <Button variant="ghost" size="sm" @click="goToCurrentWeek">
        Semana Actual
      </Button>
    </div>
    
    <div class="text-center">
      <div class="text-sm text-muted-foreground">Semana {{ currentWeek }} de {{ currentYear }}</div>
      <div class="font-medium">{{ weekRangeLabel }}</div>
    </div>
  </div>
</template>

