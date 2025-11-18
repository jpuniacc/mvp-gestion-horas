<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const titleClasses = computed(() => {
  return cn('text-lg font-semibold leading-none tracking-tight', props.class)
})
</script>

<template>
  <h2 :class="titleClasses">
    <slot />
  </h2>
</template>

