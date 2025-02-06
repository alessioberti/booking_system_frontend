<!-- views/HomeView.vue -->
<template>
  <div>
    <h1>Home</h1>
    <p>
      Benvenuto,
      <span v-if="user">{{ user.email }}</span>
      <span v-else>ospite</span>
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const user = computed(() => authStore.user);
</script>
