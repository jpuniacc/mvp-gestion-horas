<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  alt?: string
  class?: string
}

const props = defineProps<Props>()

const imageClasses = computed(() => {
  return cn('aspect-square h-full w-full', props.class)
})
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    :class="imageClasses"
  />
</template>

