<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const avatarClasses = computed(() => {
  return cn(
    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
    props.class
  )
})
</script>

<template>
  <div :class="avatarClasses">
    <slot />
  </div>
</template>

