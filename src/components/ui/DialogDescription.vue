<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const descriptionClasses = computed(() => {
  return cn('text-sm text-muted-foreground', props.class)
})
</script>

<template>
  <p :class="descriptionClasses">
    <slot />
  </p>
</template>

