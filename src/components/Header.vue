<script setup lang="ts">
import Menu from '@/components/Menu.vue'
import Session from '@/components/Session.vue'
</script>

<template>
    <header class="border-b">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
            <Menu />
            <Session />
        </div>
    </header>
</template>

<style scoped></style>