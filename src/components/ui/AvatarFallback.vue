<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const fallbackClasses = computed(() => {
  return cn(
    'flex h-full w-full items-center justify-center rounded-full bg-muted',
    props.class
  )
})
</script>

<template>
  <span :class="fallbackClasses">
    <slot />
  </span>
</template>

