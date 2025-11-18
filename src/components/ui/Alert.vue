<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'destructive'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const alertClasses = computed(() => {
  return cn(
    'relative w-full rounded-lg border p-4',
    {
      'bg-background': props.variant === 'default',
      'border-destructive/50 text-destructive dark:border-destructive': props.variant === 'destructive',
    },
    props.class
  )
})
</script>

<template>
  <div :class="alertClasses" role="alert">
    <slot />
  </div>
</template>

