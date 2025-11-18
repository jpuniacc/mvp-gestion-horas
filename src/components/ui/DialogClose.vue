<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const buttonClasses = computed(() => {
  return cn(
    'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    props.class
  )
})

function handleClick() {
  emit('close')
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :class="buttonClasses"
    @click="handleClick"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
    <span class="sr-only">Cerrar</span>
  </Button>
</template>

