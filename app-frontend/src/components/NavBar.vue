<template>
  <nav class="bg-gray-800 text-white">
    <router-link to="/" class="font-bold text-xl">Logo</router-link>
    <ul>
      <template v-if="isLoggedIn">
        <li>
          <router-link to="/" class="hover:underline">Home</router-link>
        </li>
        <li>
          <router-link to="/manage" class="hover:underline"
            >Prenotazioni</router-link
          >
        </li>
        <li>
          <router-link to="/account" class="hover:underline"
            >Gestione Account</router-link
          >
        </li>
      </template>
      <template v-else>
        <li>
          <router-link to="/" class="hover:underline">Home</router-link>
        </li>
        <li>
          <router-link to="/login" class="hover:underline">Login</router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.user !== null);
</script>

<style></style>
