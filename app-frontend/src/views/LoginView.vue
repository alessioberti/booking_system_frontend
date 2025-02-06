<template>
  <div>
    <form class="space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-4">
        <div>
          <input
            id="email"
            type="email"
            class="input"
            v-model="email"
            required
            placeholder="Inserisci la tua email"
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            class="input"
            v-model="password"
            required
            placeholder="Inserisci la tua password"
          />
        </div>
      </div>

      <div>
        <button type="submit" class="button" :disabled="authStore.loading">
          Sign in
        </button>
      </div>
    </form>

    <div class="flex items-center justify-between">
      <router-link to="/register"> Registrati </router-link>
      <router-link to="/reset-password"> Recupera Password </router-link>
    </div>
  </div>
  <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const errorMessage = ref(null);

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = null;
  try {
    await authStore.login(email.value, password.value);
    // Dopo il login reindirizza alla home
    router.push({ name: "home" });
  } catch (err) {
    errorMessage.value = authStore.error || "Errore di login";
  }
};
</script>

<style scoped></style>
