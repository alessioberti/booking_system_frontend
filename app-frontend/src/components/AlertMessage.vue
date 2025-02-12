<template>
  <div v-if="errorMessage" class="alert alert-error" role="alert">
    {{ errorMessage }}
  </div>
  <div v-if="successMessage" class="alert alert-success" role="alert">
    {{ successMessage }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAlertStore } from '../stores/alert';

const alertStore = useAlertStore();
const errorMessage = computed(() => alertStore.errorMessage);
const successMessage = computed(() => alertStore.successMessage);
</script>
