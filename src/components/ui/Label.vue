<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  for?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
})

const labelClasses = computed(() => {
  return cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  )
})
</script>

<template>
  <label
    :class="labelClasses"
    :for="for"
  >
    <slot />
    <span v-if="required" class="text-destructive ml-1">*</span>
  </label>
</template>

